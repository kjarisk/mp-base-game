#!/bin/bash

# Server Setup and Fix Script
# Addresses common PM2 and Nginx issues

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT=$(pwd)

echo -e "${BLUE}🔧 Multiplayer Game Server Setup & Fix Script${NC}"
echo -e "${BLUE}==============================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install PM2 if not installed
install_pm2() {
    if ! command_exists pm2; then
        echo -e "${YELLOW}Installing PM2...${NC}"
        npm install -g pm2
        pm2 startup
        echo -e "${GREEN}✅ PM2 installed${NC}"
    else
        echo -e "${GREEN}✅ PM2 already installed${NC}"
    fi
}

# Stop and clean all PM2 processes
clean_pm2() {
    echo -e "${YELLOW}Cleaning PM2 processes...${NC}"
    
    # Stop and delete all processes
    pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"
    
    # Clear logs
    pm2 flush
    
    echo -e "${GREEN}✅ PM2 processes cleaned${NC}"
}

# Start applications with proper configuration
start_applications() {
    echo -e "${YELLOW}Starting applications...${NC}"
    
    # Ensure log directory exists
    mkdir -p logs
    
    # Start test environment
    echo -e "${BLUE}Starting test environment (port 3001)...${NC}"
    pm2 start config/ecosystem.test.json
    
    # Wait a moment for startup
    sleep 3
    
    # Start production environment
    echo -e "${BLUE}Starting production environment (port 3000)...${NC}"
    pm2 start config/ecosystem.production.json
    
    # Save PM2 configuration
    pm2 save
    
    echo -e "${GREEN}✅ Applications started${NC}"
}

# Test application endpoints
test_endpoints() {
    echo -e "${YELLOW}Testing application endpoints...${NC}"
    
    # Test test environment
    echo -e "${BLUE}Testing test environment (http://localhost:3001)...${NC}"
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Test environment responding${NC}"
    else
        echo -e "${RED}❌ Test environment not responding${NC}"
    fi
    
    # Test production environment
    echo -e "${BLUE}Testing production environment (http://localhost:3000)...${NC}"
    if curl -s http://localhost:3000/health > /dev/null; then
        echo -e "${GREEN}✅ Production environment responding${NC}"
    else
        echo -e "${RED}❌ Production environment not responding${NC}"
    fi
}

# Check and fix Nginx configuration
fix_nginx() {
    echo -e "${YELLOW}Checking Nginx configuration...${NC}"
    
    if command_exists nginx; then
        # Test configuration
        if sudo nginx -t 2>/dev/null; then
            echo -e "${GREEN}✅ Nginx configuration valid${NC}"
            
            # Reload Nginx
            sudo systemctl reload nginx
            echo -e "${GREEN}✅ Nginx reloaded${NC}"
        else
            echo -e "${RED}❌ Nginx configuration has errors${NC}"
            echo -e "${YELLOW}Please check /etc/nginx/sites-available/mp-game${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Nginx not installed${NC}"
    fi
}

# Check port conflicts
check_ports() {
    echo -e "${YELLOW}Checking for port conflicts...${NC}"
    
    local test_port=$(netstat -tlnp 2>/dev/null | grep :3001 | wc -l)
    local prod_port=$(netstat -tlnp 2>/dev/null | grep :3000 | wc -l)
    
    if [ $test_port -gt 1 ]; then
        echo -e "${RED}❌ Multiple processes on port 3001${NC}"
        netstat -tlnp | grep :3001
    else
        echo -e "${GREEN}✅ Port 3001 clean${NC}"
    fi
    
    if [ $prod_port -gt 1 ]; then
        echo -e "${RED}❌ Multiple processes on port 3000${NC}"
        netstat -tlnp | grep :3000
    else
        echo -e "${GREEN}✅ Port 3000 clean${NC}"
    fi
}

# Show status
show_status() {
    echo -e "${BLUE}Current Status:${NC}"
    echo -e "${BLUE}===============${NC}"
    
    echo -e "${YELLOW}PM2 Processes:${NC}"
    pm2 list
    
    echo ""
    echo -e "${YELLOW}Port Usage:${NC}"
    netstat -tlnp | grep -E ":(3001|3000)" || echo "No processes on ports 3001 or 3000"
    
    echo ""
    echo -e "${YELLOW}Application Health:${NC}"
    curl -s http://localhost:3001/health 2>/dev/null && echo "Test environment: OK" || echo "Test environment: ERROR"
    curl -s http://localhost:3000/health 2>/dev/null && echo "Production environment: OK" || echo "Production environment: ERROR"
}

# Initialize backup system
init_backups() {
    echo -e "${YELLOW}Initializing backup system...${NC}"
    ./scripts/backup-manager.sh init
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Available Commands:${NC}"
    echo "1. full-fix     - Complete server reset and setup"
    echo "2. install      - Install PM2 if missing"
    echo "3. clean        - Clean PM2 processes"
    echo "4. start        - Start applications"
    echo "5. test         - Test endpoints"
    echo "6. nginx        - Fix Nginx configuration"
    echo "7. ports        - Check port conflicts"
    echo "8. status       - Show current status"
    echo "9. backup-init  - Initialize backup system"
    echo "10. help        - Show this menu"
}

# Execute based on parameter
case "${1:-help}" in
    "full-fix")
        install_pm2
        clean_pm2
        check_ports
        start_applications
        sleep 5
        test_endpoints
        fix_nginx
        init_backups
        show_status
        ;;
    "install")
        install_pm2
        ;;
    "clean")
        clean_pm2
        ;;
    "start")
        start_applications
        ;;
    "test")
        test_endpoints
        ;;
    "nginx")
        fix_nginx
        ;;
    "ports")
        check_ports
        ;;
    "status")
        show_status
        ;;
    "backup-init")
        init_backups
        ;;
    "help"|*)
        show_menu
        ;;
esac
