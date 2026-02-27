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
echo -e "${BOLD}4.${NC} 📋 ${GREEN}TEMPLATES${NC} - Manajemen template surat"
echo -e "${BOLD}5.${NC} 💰 ${GREEN}SPP${NC} - Manajemen keuangan & tagihan siswa"
echo -e "${BOLD}6.${NC} 📦 ${GREEN}ALL${NC} - Semua fitur"
echo -e "${BOLD}7.${NC} 🎯 ${GREEN}CUSTOM${NC} - Pilih kombinasi fitur"
echo -e "${BOLD}0.${NC} ❌ ${RED}EXIT${NC}"
echo ""
echo -ne "${BOLD}${YELLOW}Pilihan Anda [0-7]: ${NC}"
read choice

COLLECT_SURAT=false
COLLECT_LEMBAGA=false
COLLECT_AUTH=false
COLLECT_TEMPLATES=false
COLLECT_SPP=false

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
        COLLECT_TEMPLATES=true
        echo -e "${GREEN}✓ Collecting: TEMPLATES${NC}"
        ;;
    5)
        COLLECT_SPP=true
        echo -e "${GREEN}✓ Collecting: SPP${NC}"
        ;;
    6)
        COLLECT_SURAT=true
        COLLECT_LEMBAGA=true
        COLLECT_AUTH=true
        COLLECT_TEMPLATES=true
        COLLECT_SPP=true
        echo -e "${GREEN}✓ Collecting: ALL FEATURES${NC}"
        ;;
    7)
        echo ""
        echo -e "${BOLD}${CYAN}Pilih fitur (pisahkan dengan spasi, contoh: 1 3 5):${NC}"
        echo -e "1. SURAT  2. LEMBAGA  3. AUTH  4. TEMPLATES  5. SPP"
        echo -ne "${BOLD}${YELLOW}Fitur: ${NC}"
        read -a features
        
        for feat in "${features[@]}"; do
            case $feat in
                1) COLLECT_SURAT=true; echo -e "${GREEN}✓ Added: SURAT${NC}" ;;
                2) COLLECT_LEMBAGA=true; echo -e "${GREEN}✓ Added: LEMBAGA${NC}" ;;
                3) COLLECT_AUTH=true; echo -e "${GREEN}✓ Added: AUTH${NC}" ;;
                4) COLLECT_TEMPLATES=true; echo -e "${GREEN}✓ Added: TEMPLATES${NC}" ;;
                5) COLLECT_SPP=true; echo -e "${GREEN}✓ Added: SPP${NC}" ;;
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

echo ""
echo -e "${CYAN}  📄 Root App Files${NC}"
collect_file "$CLIENT_ROOT/app/layout.tsx"
collect_file "$CLIENT_ROOT/app/page.tsx"
collect_file "$CLIENT_ROOT/app/globals.css"
collect_file "$CLIENT_ROOT/app/loading.tsx"
collect_file "$CLIENT_ROOT/app/error.tsx"
collect_file "$CLIENT_ROOT/app/not-found.tsx"

echo ""
echo -e "${CYAN}  ⚙️  Constants${NC}"
collect_file "$CLIENT_ROOT/constants/index.ts"
collect_file "$CLIENT_ROOT/constants/paper-config.ts"
collect_file "$CLIENT_ROOT/constants/permissions.ts"
collect_file "$CLIENT_ROOT/constants/routes.ts"

echo ""
echo -e "${CYAN}  🎣 Hooks (Generic)${NC}"
collect_file "$CLIENT_ROOT/hooks/index.ts"
collect_file "$CLIENT_ROOT/hooks/use-media-query.ts"
collect_file "$CLIENT_ROOT/hooks/use-permissions.ts"

echo ""
echo -e "${CYAN}  📚 Libraries${NC}"
collect_file "$CLIENT_ROOT/lib/date/index.ts"
collect_file "$CLIENT_ROOT/lib/format/index.ts"
collect_file "$CLIENT_ROOT/lib/supabase/client.ts"
collect_file "$CLIENT_ROOT/lib/supabase/proxy.ts"
collect_file "$CLIENT_ROOT/lib/supabase/server.ts"
collect_file "$CLIENT_ROOT/lib/utils.ts"
collect_file "$CLIENT_ROOT/lib/validators.ts"

echo ""
echo -e "${CYAN}  💾 Stores${NC}"
collect_file "$CLIENT_ROOT/stores/index.ts"

echo ""
echo -e "${CYAN}  📝 Types${NC}"
collect_file "$CLIENT_ROOT/types/index.ts"
collect_file "$CLIENT_ROOT/types/database.ts"

echo ""
echo -e "${CYAN}  🎨 Layout Components${NC}"
collect_file "$CLIENT_ROOT/components/layout/index.ts"
collect_file "$CLIENT_ROOT/components/layout/app-sidebar.tsx"
collect_file "$CLIENT_ROOT/components/layout/header.tsx"
collect_file "$CLIENT_ROOT/components/layout/mobile-nav.tsx"
collect_file "$CLIENT_ROOT/components/layout/nav-config.ts"

echo ""
echo -e "${CYAN}  🔧 Shared Components${NC}"
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

echo ""
echo -e "${CYAN}  🏠 Dashboard Layout${NC}"
collect_file "$CLIENT_ROOT/app/(dashboard)/layout.tsx"

echo ""
echo -e "${CYAN}  🌐 Proxy${NC}"
collect_file "$CLIENT_ROOT/proxy.ts"

echo ""
echo -e "${YELLOW}  ⏭️  SKIPPED: components/ui/* (shadcn auto-generated)${NC}"

# ================================================
# AUTH & USER MANAGEMENT
# ================================================
if [ "$COLLECT_AUTH" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}🔐 AUTH & USER MANAGEMENT${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo ""
    echo -e "${CYAN}  🔑 Auth Routes${NC}"
    collect_file "$CLIENT_ROOT/app/(auth)/layout.tsx"
    collect_file "$CLIENT_ROOT/app/(auth)/login/page.tsx"
    collect_file "$CLIENT_ROOT/app/api/auth/callback/route.ts"
    
    echo ""
    echo -e "${CYAN}  🧩 Auth Components${NC}"
    collect_file "$CLIENT_ROOT/components/features/index.ts"
    collect_file "$CLIENT_ROOT/components/features/auth/index.ts"
    collect_file "$CLIENT_ROOT/components/features/auth/login-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/auth/logout-button.tsx"
    
    echo ""
    echo -e "${CYAN}  🎁 Providers${NC}"
    collect_file "$CLIENT_ROOT/components/providers/index.ts"
    collect_file "$CLIENT_ROOT/components/providers/auth-provider.tsx"
    
    echo ""
    echo -e "${CYAN}  🎣 Auth Hooks${NC}"
    collect_file "$CLIENT_ROOT/hooks/use-auth.ts"
    
    echo ""
    echo -e "${CYAN}  💾 Auth Store${NC}"
    collect_file "$CLIENT_ROOT/stores/auth-store.ts"
    
    echo ""
    echo -e "${CYAN}  👥 User Management${NC}"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/pengguna/page.tsx"
    
    echo ""
    echo -e "${CYAN}  👤 User Profile${NC}"
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
    
    echo ""
    echo -e "${CYAN}  📄 Lembaga Pages${NC}"
    collect_file "$CLIENT_ROOT/app/(dashboard)/lembaga/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/lembaga/[id]/page.tsx"
    
    echo ""
    echo -e "${CYAN}  ⚙️  Admin Lembaga${NC}"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/lembaga/page.tsx"
    
    echo ""
    echo -e "${CYAN}  🎣 Lembaga Hooks${NC}"
    collect_file "$CLIENT_ROOT/hooks/use-lembaga.ts"
fi

# ================================================
# TEMPLATES MANAGEMENT
# ================================================
if [ "$COLLECT_TEMPLATES" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}📋 TEMPLATES MANAGEMENT${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo ""
    echo -e "${CYAN}  📄 Template Pages${NC}"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/templates/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/templates/create/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/templates/[id]/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/templates/[id]/edit/page.tsx"
    
    echo ""
    echo -e "${CYAN}  🔌 Template API${NC}"
    collect_file "$CLIENT_ROOT/app/api/templates/route.ts"
    collect_file "$CLIENT_ROOT/app/api/templates/[id]/route.ts"
    
    echo ""
    echo -e "${CYAN}  🧩 Template Components${NC}"
    collect_file "$CLIENT_ROOT/components/features/templates/index.ts"
    collect_file "$CLIENT_ROOT/components/features/templates/template-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/templates/template-preview-modal.tsx"
    
    echo ""
    echo -e "${CYAN}  🎣 Template Hooks${NC}"
    collect_file "$CLIENT_ROOT/hooks/use-template.ts"
    
    echo ""
    echo -e "${CYAN}  📚 Template Libraries${NC}"
    collect_file "$CLIENT_ROOT/lib/template-parser.ts"
    collect_file "$CLIENT_ROOT/lib/tembusan-helper.ts"
    collect_file "$CLIENT_ROOT/lib/template-sample-data.ts"
    
    echo ""
    echo -e "${CYAN}  📝 Template Types${NC}"
    collect_file "$CLIENT_ROOT/types/template.ts"
fi

# ================================================
# SURAT MANAGEMENT
# ================================================
if [ "$COLLECT_SURAT" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}✉️  SURAT MANAGEMENT${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo ""
    echo -e "${CYAN}  📄 Surat Pages${NC}"
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/buat/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/[id]/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/surat/[id]/edit/page.tsx"
    
    echo ""
    echo -e "${CYAN}  🔌 Surat API${NC}"
    collect_file "$CLIENT_ROOT/app/api/surat/create/route.ts"
    collect_file "$CLIENT_ROOT/app/api/surat/[id]/route.ts"
    
    echo ""
    echo -e "${CYAN}  ⚙️  Surat Config${NC}"
    collect_file "$CLIENT_ROOT/constants/surat-config.ts"
    collect_file "$CLIENT_ROOT/constants/template-registry.ts"
    
    echo ""
    echo -e "${CYAN}  🎣 Surat Hooks${NC}"
    collect_file "$CLIENT_ROOT/hooks/use-surat.ts"
    
    echo ""
    echo -e "${CYAN}  📚 Surat Libraries${NC}"
    collect_file "$CLIENT_ROOT/lib/template-composer.ts"
    collect_file "$CLIENT_ROOT/lib/mock-surat-generator.ts"
    
    echo ""
    echo -e "${CYAN}  🧩 Surat Core Components${NC}"
    collect_file "$CLIENT_ROOT/components/features/surat/index.ts"
    collect_file "$CLIENT_ROOT/components/features/surat/surat-renderer.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/template-renderer.ts"
    
    echo ""
    echo -e "${CYAN}  📝 Surat Forms${NC}"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/surat-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/tembusan-input.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/template-dynamic-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/template-fields.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/template-selector.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/forms/template-selector-db.tsx"
    
    echo ""
    echo -e "${CYAN}  🎨 Surat Layouts${NC}"
    collect_file "$CLIENT_ROOT/components/features/surat/layouts/universal-layout.tsx"
    
    echo ""
    echo -e "${CYAN}  📄 Surat PDF${NC}"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/index.ts"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/pdf-preview-modal.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/pdf-styles.ts"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/pdf-surat-document.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/pdf/pdf-template-body.tsx"
    
    echo ""
    echo -e "${CYAN}  🔧 Surat Shared Components${NC}"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/kop-surat.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/signature-block.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/surat-body.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/surat-meta.tsx"
    collect_file "$CLIENT_ROOT/components/features/surat/shared/tembusan-list.tsx"
fi

# ================================================
# SPP MANAGEMENT
# ================================================
if [ "$COLLECT_SPP" = true ]; then
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}💰 SPP MANAGEMENT${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    echo ""
    echo -e "${CYAN}  📝 SPP Types & Config${NC}"
    collect_file "$CLIENT_ROOT/types/spp.ts"
    collect_file "$CLIENT_ROOT/constants/spp-config.ts"

    echo ""
    echo -e "${CYAN}  💾 SPP Store${NC}"
    collect_file "$CLIENT_ROOT/stores/spp-store.ts"

    echo ""
    echo -e "${CYAN}  🎣 SPP Hooks${NC}"
    collect_file "$CLIENT_ROOT/hooks/use-siswa.ts"
    collect_file "$CLIENT_ROOT/hooks/use-jenis-tagihan.ts"
    collect_file "$CLIENT_ROOT/hooks/use-tagihan.ts"
    collect_file "$CLIENT_ROOT/hooks/use-pembayaran.ts"
    collect_file "$CLIENT_ROOT/hooks/use-pengeluaran.ts"
    collect_file "$CLIENT_ROOT/hooks/use-ringkasan-spp.ts"

    echo ""
    echo -e "${CYAN}  🔌 SPP API${NC}"
    collect_file "$CLIENT_ROOT/app/api/spp/tagihan/route.ts"
    collect_file "$CLIENT_ROOT/app/api/spp/tagihan/generate/route.ts"
    collect_file "$CLIENT_ROOT/app/api/spp/pembayaran/route.ts"
    collect_file "$CLIENT_ROOT/app/api/spp/pengeluaran/route.ts"

    echo ""
    echo -e "${CYAN}  🧩 SPP Components${NC}"
    collect_file "$CLIENT_ROOT/components/features/spp/index.ts"
    collect_file "$CLIENT_ROOT/components/features/spp/siswa-table.tsx"
    collect_file "$CLIENT_ROOT/components/features/spp/tagihan-status-badge.tsx"

    echo ""
    echo -e "${CYAN}  📝 SPP Forms${NC}"
    collect_file "$CLIENT_ROOT/components/features/spp/forms/siswa-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/spp/forms/jenis-tagihan-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/spp/forms/pembayaran-form.tsx"
    collect_file "$CLIENT_ROOT/components/features/spp/forms/pengeluaran-form.tsx"

    echo ""
    echo -e "${CYAN}  📄 SPP PDF${NC}"
    collect_file "$CLIENT_ROOT/components/features/spp/pdf/pdf-tagihan-document.tsx"
    collect_file "$CLIENT_ROOT/components/features/spp/pdf/pdf-kwitansi-document.tsx"
    collect_file "$CLIENT_ROOT/components/features/spp/pdf/pdf-laporan-bulanan.tsx"
    collect_file "$CLIENT_ROOT/components/features/spp/pdf/pdf-laporan-document.tsx"

    echo ""
    echo -e "${CYAN}  📄 SPP Pages (Staff)${NC}"
    collect_file "$CLIENT_ROOT/app/(dashboard)/spp/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/spp/siswa/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/spp/tagihan/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/spp/tagihan/generate/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/spp/tagihan/[id]/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/spp/pengeluaran/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/spp/laporan/page.tsx"

    echo ""
    echo -e "${CYAN}  ⚙️  SPP Pages (Admin)${NC}"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/spp/siswa/page.tsx"
    collect_file "$CLIENT_ROOT/app/(dashboard)/admin/spp/jenis-tagihan/page.tsx"
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
echo -e "${CYAN}📦 File size: ${NC}$(du -h "$OUT" | cut -f1)"
echo ""
echo -e "${BOLD}Features collected:${NC}"
[ "$COLLECT_AUTH" = true ] && echo -e "  ${GREEN}✓${NC} Auth & User Management"
[ "$COLLECT_LEMBAGA" = true ] && echo -e "  ${GREEN}✓${NC} Lembaga Management"
[ "$COLLECT_TEMPLATES" = true ] && echo -e "  ${GREEN}✓${NC} Templates Management"
[ "$COLLECT_SURAT" = true ] && echo -e "  ${GREEN}✓${NC} Surat Management"
[ "$COLLECT_SPP" = true ] && echo -e "  ${GREEN}✓${NC} SPP Management"
echo ""
echo -e "${BOLD}${YELLOW}Note:${NC} shadcn/ui components skipped (auto-generated)"
echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}✨ Ready to download!${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""