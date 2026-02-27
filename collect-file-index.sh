#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

WORKSPACE_ROOT="$(pwd)"
CLIENT_ROOT="$WORKSPACE_ROOT/src"
OUT="$WORKSPACE_ROOT/collected-index.md"

echo "" > "$OUT"

cat >> "$OUT" << 'EOF'
# PKBM ADMINISTRASI - Index Files Collection

---

EOF

collect_file() {
    local file=$1
    if [ -f "$file" ]; then
        local rel="${file#$WORKSPACE_ROOT/}"
        local lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        local ext="${file##*.}"
        echo -e "${GREEN}  ✓ ${NC}$rel ${CYAN}(${lines} lines)${NC}"
        cat >> "$OUT" << EOF

## \`$rel\`

\`\`\`$ext
$(cat "$file")
\`\`\`

---

EOF
    else
        echo -e "${YELLOW}  ⚠ SKIP (not found): ${file#$WORKSPACE_ROOT/}${NC}"
    fi
}

echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}📑 COLLECTING ALL INDEX FILES${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Constants
echo -e "\n${CYAN}  ⚙️  Constants${NC}"
collect_file "$CLIENT_ROOT/constants/index.ts"

# Hooks
echo -e "\n${CYAN}  🎣 Hooks${NC}"
collect_file "$CLIENT_ROOT/hooks/index.ts"

# Stores
echo -e "\n${CYAN}  💾 Stores${NC}"
collect_file "$CLIENT_ROOT/stores/index.ts"

# Types
echo -e "\n${CYAN}  📝 Types${NC}"
collect_file "$CLIENT_ROOT/types/index.ts"

# Lib
echo -e "\n${CYAN}  📚 Lib${NC}"
collect_file "$CLIENT_ROOT/lib/date/index.ts"
collect_file "$CLIENT_ROOT/lib/format/index.ts"

# Components - Layout
echo -e "\n${CYAN}  🎨 Components / Layout${NC}"
collect_file "$CLIENT_ROOT/components/layout/index.ts"

# Components - Shared
echo -e "\n${CYAN}  🔧 Components / Shared${NC}"
collect_file "$CLIENT_ROOT/components/shared/index.ts"

# Components - Providers
echo -e "\n${CYAN}  🎁 Components / Providers${NC}"
collect_file "$CLIENT_ROOT/components/providers/index.ts"

# Components - Features (root)
echo -e "\n${CYAN}  🧩 Components / Features${NC}"
collect_file "$CLIENT_ROOT/components/features/index.ts"

# Components - Features / Auth
echo -e "\n${CYAN}  🔐 Components / Features / Auth${NC}"
collect_file "$CLIENT_ROOT/components/features/auth/index.ts"

# Components - Features / SPP
echo -e "\n${CYAN}  💰 Components / Features / SPP${NC}"
collect_file "$CLIENT_ROOT/components/features/spp/index.ts"

# Components - Features / Surat
echo -e "\n${CYAN}  ✉️  Components / Features / Surat${NC}"
collect_file "$CLIENT_ROOT/components/features/surat/index.ts"
collect_file "$CLIENT_ROOT/components/features/surat/pdf/index.ts"

# Components - Features / Templates
echo -e "\n${CYAN}  📋 Components / Features / Templates${NC}"
collect_file "$CLIENT_ROOT/components/features/templates/index.ts"

echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ DONE!${NC}"
echo -e "${GREEN}📄 Output: ${NC}$OUT"
echo -e "${CYAN}📦 Size: ${NC}$(du -h "$OUT" | cut -f1)"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"