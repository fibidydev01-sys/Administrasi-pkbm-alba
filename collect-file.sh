#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

WORKSPACE_ROOT="$(pwd)"
CLIENT_ROOT="$WORKSPACE_ROOT/src"
OUT="$WORKSPACE_ROOT/collected-src.md"

echo "" > "$OUT"

# Header for markdown
cat >> "$OUT" << 'EOF'
# PKBM ADMINISTRASI - Source Code Collection

**Generated:** $(date)
**Project:** ADMINISTRASI-PKBM Client Application

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

**Lines:** $lines

\`\`\`$ext
$(cat "$file")
\`\`\`

---

EOF
    else
        echo -e "${YELLOW}  ⚠ SKIP (not found): ${file#$WORKSPACE_ROOT/}${NC}"
    fi
}

# ================================================
# MENU SELECTION
# ================================================
clear
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║                                                    ║${NC}"
echo -e "${BOLD}${BLUE}║        PKBM ADMINISTRASI - CODE COLLECTOR          ║${NC}"
echo -e "${BOLD}${BLUE}║                                                    ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}${CYAN}Pilih fitur yang ingin dikumpulkan:${NC}"
echo ""
echo -e "${BOLD}1.${NC} ✉️  ${GREEN}SURAT${NC} - Manajemen surat menyurat"
echo -e "${BOLD}2.${NC} 🏢 ${GREEN}LEMBAGA${NC} - Manajemen organisasi/institusi"
echo -e "${BOLD}3.${NC} 🔐 ${GREEN}AUTH & USER${NC} - Authentication & manajemen pengguna"
echo -e "${BOLD}4.${NC} 📦 ${GREEN}ALL${NC} - Semua fitur (Surat + Lembaga + Auth)"
echo -e "${BOLD}5.${NC} 🎯 ${GREEN}CUSTOM${NC} - Pilih kombinasi fitur"
echo -e "${BOLD}0.${NC} ❌ ${RED}EXIT${NC}"
echo ""
echo -ne "${BOLD}${YELLOW}Pilihan Anda [0-5]: ${NC}"
read choice

COLLECT_SURAT=false
COLLECT_LEMBAGA=false
COLLECT_AUTH=false

case $choice in
    1)
        COLLECT_SURAT=true
        echo -e "${GREEN}✓ Collecting: SURAT${NC}"
        ;;
    2)
        COLLECT_LEMBAGA=true
        echo -e "${GREEN}✓ Collecting: LEMBAGA${NC}"
        ;;
    3)
        COLLECT_AUTH=true
        echo -e "${GREEN}✓ Collecting: AUTH & USER${NC}"
        ;;
    4)
        COLLECT_SURAT=true
        COLLECT_LEMBAGA=true
        COLLECT_AUTH=true
        echo -e "${GREEN}✓ Collecting: ALL FEATURES${NC}"
        ;;
    5)
        echo ""
        echo -e "${BOLD}${CYAN}Pilih fitur (pisahkan dengan spasi, contoh: 1 3):${NC}"
        echo -e "1. SURAT  2. LEMBAGA  3. AUTH"
        echo -ne "${BOLD}${YELLOW}Fitur: ${NC}"
        read -a features
        
        for feat in "${features[@]}"; do
            case $feat in
                1) COLLECT_SURAT=true; echo -e "${GREEN}✓ Added: SURAT${NC}" ;;
                2) COLLECT_LEMBAGA=true; echo -e "${GREEN}✓ Added: LEMBAGA${NC}" ;;
                3) COLLECT_AUTH=true; echo -e "${GREEN}✓ Added: AUTH${NC}" ;;
            esac
        done
        ;;
    0)
        echo -e "${RED}Dibatalkan.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Pilihan tidak valid!${NC}"
        exit 1
        ;;
esac

echo ""
sleep 1

# ================================================
# CORE FILES (ALWAYS COLLECTED)
# ================================================
echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}📁 CORE FILES (Always Included)${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Constants
collect_file "$CLIENT_ROOT/constants/index.ts"
collect_file "$CLIENT_ROOT/constants/paper-config.ts"
collect_file "$CLIENT_ROOT/constants/permissions.ts"
collect_file "$CLIENT_ROOT/constants/routes.ts"

# Hooks (generic)
collect_file "$CLIENT_ROOT/hooks/index.ts"
collect_file "$CLIENT_ROOT/hooks/use-media-query.ts"
collect_file "$CLIENT_ROOT/hooks/use-permissions.ts"

# Lib
collect_file "$CLIENT_ROOT/lib/date/index.ts"
collect_file "$CLIENT_ROOT/lib/format/index.ts"
collect_file "$CLIENT_ROOT/lib/supabase/client.ts"
collect_file "$CLIENT_ROOT/lib/supabase/proxy.ts"
collect_file "$CLIENT_ROOT/lib/supabase/server.ts"
collect_file "$CLIENT_ROOT/lib/utils.ts"
collect_file "$CLIENT_ROOT/lib/validators.ts"

# Stores
collect_file "$CLIENT_ROOT/stores/index.ts"

# Types
collect_file "$CLIENT_ROOT/types/index.ts"
collect_file "$CLIENT_ROOT/types/database.ts"

# Layout Components (shared)
collect_file "$CLIENT_ROOT/components/layout/index.ts"
collect_file "$CLIENT_ROOT/components/layout/app-sidebar.tsx"
collect_file "$CLIENT_ROOT/components/layout/header.tsx"
collect_file "$CLIENT_ROOT/components/layout/mobile-nav.tsx"
collect_file "$CLIENT_ROOT/components/layout/nav-config.ts"

# Shared Components (Phase 1+2 updated)
collect_file "$CLIENT_ROOT/components/shared/index.ts"
collect_file "$CLIENT_ROOT/components/shared/avatar-display.tsx"
collect_file "$CLIENT_ROOT/components/shared/confirm-dialog.tsx"
collect_file "$CLIENT_ROOT/components/shared/data-table.tsx"
collect_file "$CLIENT_ROOT/components/shared/empty-state.tsx"
collect_file "$CLIENT_ROOT/components/shared/error-alert.tsx"
collect_file "$CLIENT_ROOT/components/shared/form-field.tsx"
collect_file "$CLIENT_ROOT/components/shared/loading-spinner.tsx"
collect_file "$CLIENT_ROOT/components/shared/loading-wrapper.tsx"
collect_file "$CLIENT_ROOT/components/shared/offline-detector.tsx"
collect_file "$CLIENT_ROOT/components/shared/page-header.tsx"
collect_file "$CLIENT_ROOT/components/shared/status-badge.tsx"

# Dashboard layout
collect_file "$CLIENT_ROOT/app/(dashboard)/layout.tsx"

# Root files
collect_file "$CLIENT_ROOT/proxy.ts"

# ================================================
# AUTH & USER MANAGEMENT
# ================================================
if [ "$COLLECT_AUTH" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}🔐 AUTH & USER MANAGEMENT${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Auth routes
    collect_file "$CLIENT_ROOT/app/(auth)/layout.tsx"
    collect_file "$CLIENT_ROOT/app/(auth)/login/page.tsx"
    collect_file "$CLIENT_ROOT/app/api/auth/callback/route.ts"
    
    # Auth components
    collect_file "$CLIENT_ROOT/components/features/index.ts"
    collect_file "$CLIENT_ROOT/components/features/auth/index.ts"
    collect_file "$CLIENT_ROOT/components/features/auth/login-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/auth/logout-button.tsx"
    
    # Providers
    collect_file "$CLIENT_ROOT/components/providers/index.ts"
    collect_file "$CLIENT_ROOT/components/providers/auth-provider.tsx"
    
    # Hooks
    collect_file "$CLIENT_ROOT/hooks/use-auth.ts"
    
    # Stores
    collect_file "$CLIENT_ROOT/stores/auth-store.ts"
    
    # Admin - User Management
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/pengguna/page.tsx"
    
    # Profil
    collect_file "$CLIENT_ROOT/app/(dashboard)/profil/page.tsx"
fi

# ================================================
# LEMBAGA MANAGEMENT
# ================================================
if [ "$COLLECT_LEMBAGA" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}🏢 LEMBAGA MANAGEMENT${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Lembaga routes
    collect_file "$CLIENT_ROOT/app/(dashboard)/lembaga/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/lembaga/[id]/page.tsx"
    
    # Admin - Lembaga Management
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/lembaga/page.tsx"
    
    # Hooks
    collect_file "$CLIENT_ROOT/hooks/use-lembaga.ts"
fi

# ================================================
# SURAT MANAGEMENT
# ================================================
if [ "$COLLECT_SURAT" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}✉️  SURAT MANAGEMENT${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Surat routes
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/buat/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/[id]/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/[id]/edit/page.tsx"
    
    # API routes
    collect_file "$CLIENT_ROOT/app/api/surat/create/route.ts"
    collect_file "$CLIENT_ROOT/app/api/surat/[id]/route.ts"
    
    # Constants
    collect_file "$CLIENT_ROOT/constants/surat-config.ts"
    collect_file "$CLIENT_ROOT/constants/template-registry.ts"
    
    # Hooks
    collect_file "$CLIENT_ROOT/hooks/use-surat.ts"
    
    # Lib
    collect_file "$CLIENT_ROOT/lib/template-composer.ts"
    
    # Types
    collect_file "$CLIENT_ROOT/types/template.ts"
    
    # Surat Components
    collect_file "$CLIENT_ROOT/components/features/surat/index.ts"
    collect_file "$CLIENT_ROOT/components/features/surat/surat-renderer.tsx"
    
    # Surat Forms
    collect_file "$CLIENT_ROOT/components/features/surat/forms/surat-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/tembusan-input.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/template-fields.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/template-selector.tsx"
    
    # Surat Layouts (Phase 1+2 refactored: 5 files → 1 universal-layout)
    collect_file "$CLIENT_ROOT/components/features/surat/layouts/universal-layout.tsx"
    
    # Surat PDF
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/index.ts"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/pdf-preview-modal.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/pdf-styles.ts"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/pdf-surat-document.tsx"
    
    # Surat Shared
    collect_file "$CLIENT_ROOT/components/features/surat/shared/kop-surat.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/signature-block.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/surat-body.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/surat-meta.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/tembusan-list.tsx"
fi

# ================================================
# SUMMARY
# ================================================
echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}✅ COLLECTION COMPLETE!${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📄 Output file: ${NC}$OUT"
echo -e "${CYAN}📝 Total lines: ${NC}$(wc -l < "$OUT")"
echo ""
echo -e "${BOLD}Features collected:${NC}"
[ "$COLLECT_AUTH" = true ] && echo -e "  ${GREEN}✓${NC} Auth & User Management"
[ "$COLLECT_LEMBAGA" = true ] && echo -e "  ${GREEN}✓${NC} Lembaga Management"
[ "$COLLECT_SURAT" = true ] && echo -e "  ${GREEN}✓${NC} Surat Management"
echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}✨ Ready to download!${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""