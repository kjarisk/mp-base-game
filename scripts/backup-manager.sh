#!/bin/bash

# Backup Management Script
# Organizes and manages database backups

BACKUP_DIR="/var/backups/mp-game"
PROJECT_BACKUP_DIR="./backups"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directories
create_backup_dirs() {
    echo -e "${YELLOW}Creating backup directories...${NC}"
    
    # Create system backup directory (requires sudo)
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown $USER:$USER "$BACKUP_DIR"
    
    # Create project backup directory
    mkdir -p "$PROJECT_BACKUP_DIR"
    
    echo -e "${GREEN}✅ Backup directories created${NC}"
}

# Backup database
backup_database() {
    local env=${1:-"test"}
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backup_${env}_${timestamp}.sql"
    local backup_path="$BACKUP_DIR/$backup_file"
    
    echo -e "${YELLOW}Creating $env database backup...${NC}"
    
    if [ "$env" = "production" ]; then
        PGPASSWORD="prod_password_456" pg_dump -h localhost -U mp_game_user mp_game_prod > "$backup_path"
    else
        PGPASSWORD="test_password_123" pg_dump -h localhost -U mp_game_user mp_game_test > "$backup_path"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created: $backup_path${NC}"
        
        # Create symlink in project directory for easy access
        ln -sf "$backup_path" "$PROJECT_BACKUP_DIR/latest_${env}.sql"
        
        # Show backup size
        local size=$(du -h "$backup_path" | cut -f1)
        echo -e "${GREEN}   Size: $size${NC}"
    else
        echo -e "${RED}❌ Backup failed for $env database${NC}"
        return 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    echo -e "${YELLOW}Cleaning up backups older than $RETENTION_DAYS days...${NC}"
    
    # Find and remove old backups
    local count=$(find "$BACKUP_DIR" -name "backup_*.sql" -mtime +$RETENTION_DAYS | wc -l)
    
    if [ $count -gt 0 ]; then
        find "$BACKUP_DIR" -name "backup_*.sql" -mtime +$RETENTION_DAYS -delete
        echo -e "${GREEN}✅ Removed $count old backup(s)${NC}"
    else
        echo -e "${GREEN}✅ No old backups to remove${NC}"
    fi
}

# List backups
list_backups() {
    echo -e "${YELLOW}Available backups:${NC}"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -lah "$BACKUP_DIR"/backup_*.sql 2>/dev/null | while read line; do
            echo "  $line"
        done
    fi
    
    echo ""
    echo -e "${YELLOW}Latest symlinks in project:${NC}"
    ls -lah "$PROJECT_BACKUP_DIR"/latest_*.sql 2>/dev/null || echo "  No latest backups found"
}

# Restore database
restore_database() {
    local env=${1:-"test"}
    local backup_file=$2
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Please specify backup file to restore${NC}"
        echo "Usage: $0 restore <env> <backup_file>"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        # Try to find it in backup directory
        backup_file="$BACKUP_DIR/$backup_file"
        if [ ! -f "$backup_file" ]; then
            echo -e "${RED}❌ Backup file not found: $backup_file${NC}"
            return 1
        fi
    fi
    
    echo -e "${YELLOW}Restoring $env database from $backup_file...${NC}"
    echo -e "${RED}⚠️  This will overwrite the current database!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ "$env" = "production" ]; then
            PGPASSWORD="prod_password_456" psql -h localhost -U mp_game_user mp_game_prod < "$backup_file"
        else
            PGPASSWORD="test_password_123" psql -h localhost -U mp_game_user mp_game_test < "$backup_file"
        fi
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database restored successfully${NC}"
        else
            echo -e "${RED}❌ Database restore failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}Restore cancelled${NC}"
    fi
}

# Move existing backup folders to organized structure
organize_existing_backups() {
    echo -e "${YELLOW}Organizing existing backup folders...${NC}"
    
    # Look for backup folders in common locations
    local locations=("/" "." "/home/$USER")
    
    for location in "${locations[@]}"; do
        if [ -d "$location" ]; then
            find "$location" -maxdepth 1 -name "backup-*" -type d 2>/dev/null | while read backup_dir; do
                local dirname=$(basename "$backup_dir")
                local target="$BACKUP_DIR/archived_$dirname"
                
                echo "  Moving $backup_dir to $target"
                sudo mv "$backup_dir" "$target" 2>/dev/null || mv "$backup_dir" "$target" 2>/dev/null
            done
        fi
    done
    
    echo -e "${GREEN}✅ Existing backups organized${NC}"
}

# Show usage
show_help() {
    echo "Backup Management Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  init                    Initialize backup directories"
    echo "  backup <env>           Create database backup (env: test|production)"
    echo "  list                   List available backups"
    echo "  cleanup                Remove old backups (older than $RETENTION_DAYS days)"
    echo "  restore <env> <file>   Restore database from backup"
    echo "  organize               Move existing backup folders to organized structure"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 init"
    echo "  $0 backup test"
    echo "  $0 backup production"
    echo "  $0 restore test backup_test_20240702_123456.sql"
    echo "  $0 cleanup"
}

# Main script logic
case "${1:-help}" in
    "init")
        create_backup_dirs
        organize_existing_backups
        ;;
    "backup")
        backup_database "$2"
        ;;
    "list")
        list_backups
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "restore")
        restore_database "$2" "$3"
        ;;
    "organize")
        organize_existing_backups
        ;;
    "help"|*)
        show_help
        ;;
esac
