import os

designs = {
    "backup_35mm": {
        "title": "35mm Film Strip",
        "concept": "Physical camera film strip reel. Horizontally scrolling frames.",
        "typography": "Monospace / Courier",
        "colors": "Black background, white text, orange/yellow film edge markings",
        "features": "Uses CSS clip-paths or repeating radial gradients for film perforations. Photos are treated with heavy film grain and sepia/grayscale filters."
    },
    "backup_airmail": {
        "title": "Vintage Airmail",
        "concept": "International vintage airmail envelope.",
        "typography": "Special Elite / Courier (Typewriter)",
        "colors": "Off-white paper, red and blue angled dashed borders",
        "features": "Uses repeating-linear-gradient for the classic red/white/blue envelope borders. Stamped postal marks with opacity and slight rotation."
    },
    "backup_blueprint": {
        "title": "Architectural Blueprint",
        "concept": "Cyanotype architectural drafting paper.",
        "typography": "Monospace / sans-serif strict technical drafting fonts",
        "colors": "Deep navy/cyan blue background, white grids, white text",
        "features": "CSS background grid patterns. Strict structural layout, technical metadata blocks. Images are filtered heavily blue/white (cyanotype)."
    },
    "backup_camcorder": {
        "title": "90s VHS Camcorder",
        "concept": "Through the viewfinder of an old 90s tape camcorder.",
        "typography": "VCR OSD Mono or similar blocky digital font",
        "colors": "Black background, pure white/red text",
        "features": "Blinking red REC dot, battery indicator, timestamp overlays. Scanline CSS effects, slight chromatic aberration or blur."
    },
    "backup_cinematic": {
        "title": "Cinematic Letterbox",
        "concept": "A24-style dramatic cinematic film still.",
        "typography": "Cinzel / Playfair Display / elegant serif",
        "colors": "Pure black background, stark white text",
        "features": "Ultra-widescreen letterbox constraints. Small, centered typography. Heavy reliance on dramatic photography."
    },
    "backup_dossier": {
        "title": "Classified Dossier",
        "concept": "Top secret government espionage file.",
        "typography": "Courier Prime (Mechanical Typewriter)",
        "colors": "Manila folder (#e4c59a), black typewriter ink, red stamp ink",
        "features": "Interactive redacted black bars. Stamped rotational typography. Evidence photos taped to the document."
    },
    "backup_editorial": {
        "title": "High-Fashion Editorial",
        "concept": "Vogue/Kinfolk avant-garde magazine layout.",
        "typography": "Bodoni Moda / Playfair Display (High-contrast Serif)",
        "colors": "Off-white (#f9f9f9), deep black (#111)",
        "features": "Extreme typographical scale contrast. Overlapping text and images. Massive pull quotes. Bleed-edge imagery."
    },
    "backup_gameboy": {
        "title": "8-Bit Game Boy",
        "concept": "1989 Nintendo Game Boy LCD Screen.",
        "typography": "VT323 (Pixel Font)",
        "colors": "Olive green LCD (#9bbc0f), dark green pixels (#0f380f), gray plastic bezel",
        "features": "Custom 4-color monochrome CSS filter on photos (Game Boy Camera effect). Chunky borders, pixel grid background overlay."
    },
    "backup_highend": {
        "title": "Luxury / High-End",
        "concept": "Luxury fashion brand / boutique hotel.",
        "typography": "Optima / Helvetica Neue (Ultra-thin sans-serif)",
        "colors": "Black, White, subtle warm greys",
        "features": "Extreme minimalism. Vast amounts of negative space. Thin hairlines. Monochromatic photography."
    },
    "backup_journal": {
        "title": "Leather-Bound Journal",
        "concept": "Personal, intimate handwritten diary.",
        "typography": "Caveat / Dancing Script (Handwritten)",
        "colors": "Cream paper, dark brown/black ink",
        "features": "Ruled line background pattern. Typography mimics authentic handwriting. Imperfect layout."
    },
    "backup_library": {
        "title": "Library Checkout Card",
        "concept": "Vintage manila library book due-date card.",
        "typography": "Special Elite (Typewriter)",
        "colors": "Faded manila (#fcf8eb), light blue lines, red vertical margin",
        "features": "CSS linear-gradient math to draw horizontal blue rules and vertical red margins. Rotated ink stamps for dates."
    },
    "backup_museum": {
        "title": "MoMA Exhibition",
        "concept": "Contemporary art gallery plaque / exhibition.",
        "typography": "Inter / Helvetica (Strict Neo-Grotesque)",
        "colors": "Gallery white, pure black",
        "features": "Information is presented as a physical art plaque (Artist, Title, Medium, Year). Images are framed with stark white mattes and drop shadows."
    },
    "backup_neobrutalism": {
        "title": "Neo-Brutalism",
        "concept": "Modern, aggressive web brutalism (Figma/Gumroad style).",
        "typography": "Space Grotesk / Archivo Black",
        "colors": "Harsh yellow, cyan, pink, pure black",
        "features": "Thick solid black borders, hard offset black shadows (no blur). Huge, aggressive typography."
    },
    "backup_newspaper": {
        "title": "Vintage Broadsheet Newspaper",
        "concept": "1920s New York Times broadsheet.",
        "typography": "Chomsky / Old English (Masthead), Times New Roman (Body)",
        "colors": "Newsprint off-white (#f4f1ea), faded black ink",
        "features": "Multi-column CSS layout. Drop caps. Halftone dot CSS filters on images to mimic cheap newspaper printing."
    },
    "backup_nutrition": {
        "title": "FDA Nutrition Facts",
        "concept": "Supermarket product nutrition label.",
        "typography": "Helvetica / Arial (Extremely tight, varied weights)",
        "colors": "White background, black text and borders",
        "features": "Strict tabular layout mimicking the FDA standard. Thick and thin black divider lines. 'Serving Size' and '% Daily Value' data structures."
    },
    "backup_pantone": {
        "title": "Pantone Color Swatch",
        "concept": "Physical Pantone color matching system chip.",
        "typography": "Helvetica (Left-aligned, bottom-anchored)",
        "colors": "Massive block of solid color, white bottom strip",
        "features": "The entire UI is a single card. The photo sits inside the color block. The text sits at the bottom like the color code."
    },
    "backup_receipt": {
        "title": "Thermal Receipt",
        "concept": "Supermarket/Bodega printed thermal paper receipt.",
        "typography": "Space Mono / VT323 (Monospaced Receipt Font)",
        "colors": "Thermal paper white (#f8f9fa), faded black/blue ink",
        "features": "Zig-zag torn edges at the top and bottom (using CSS clip-path or gradients). Dotted line dividers. Tabular itemized layout."
    },
    "backup_scrapbook": {
        "title": "Physical Scrapbook",
        "concept": "Messy, organic, cut-and-paste DIY scrapbook.",
        "typography": "Mixed handwritten, typewriter, and serif fonts",
        "colors": "Kraft paper brown, masking tape yellow",
        "features": "Overlapping absolutely positioned elements. CSS rotations (rotate-3, -rotate-6). Washi tape CSS effects. High texture."
    },
    "backup_swiss_archival": {
        "title": "Swiss Archival (International Style)",
        "concept": "1950s Swiss Graphic Design (Muller-Brockmann).",
        "typography": "Helvetica Neue (Strict grid alignment)",
        "colors": "Primary colors (Red, Blue, Yellow), Black, White",
        "features": "Rigid grid system. Flush left, ragged right text. Extreme mathematical alignment. Large, bold numbers."
    },
    "backup_terminal": {
        "title": "UNIX Mainframe Terminal",
        "concept": "1970s CRT Phosphor Monitor.",
        "typography": "VT323 / Courier (Terminal Monospace)",
        "colors": "Pure black background, glowing phosphor green (#0f0) text",
        "features": "CSS text-shadow for phosphor glow. Scanline background overlay. Command-line interface prompt styling (>_)."
    },
    "backup_tome": {
        "title": "Gothic Tome / Dark Academia",
        "concept": "Ancient magical manuscript or dark academia poetry book.",
        "typography": "Cinzel / Playfair Display (Ornate Serifs)",
        "colors": "Obsidian black, aged gold (#d4af37)",
        "features": "Gold foil text effects (using background-clip: text with linear-gradients). Ornate divider lines. Sepia-toned imagery."
    },
    "backup_vinyl": {
        "title": "Vinyl Record Sleeve",
        "concept": "12-inch LP Album Cover and back tracklist.",
        "typography": "Futura / Circular",
        "colors": "Varies by album art. Often solid contrasting blocks.",
        "features": "Square aspect ratio constraints. Circular record graphics. Tracklist styling."
    },
    "backup_win98": {
        "title": "Windows 98 OS",
        "concept": "Classic late-90s desktop operating system.",
        "typography": "Pixelated sans-serif (Tahoma/MS Sans Serif)",
        "colors": "Teal desktop (#008080), gray window bevels (#c0c0c0), blue title bars (#000080)",
        "features": "Classic CSS borders (inset/outset) to create 3D bevels. Title bar with X buttons. Desktop icons."
    },
    "backup_zen": {
        "title": "Zen / Wabi-Sabi",
        "concept": "Japanese minimalism, organic imperfection, calm.",
        "typography": "Noto Serif JP / elegant light serifs",
        "colors": "Muted earth tones, stone gray, sand (#f5f5f0), matcha green",
        "features": "Extreme negative space. Vertical text orientation options. Soft fading borders. Absolute tranquility."
    }
}

template = """# Design System: {title}

## Overview
This directory contains a complete, reusable UI/UX design system based on the concept of **{concept}**. 
It was originally engineered as part of the anti-slop Ellis UI Library, demonstrating how thematic, physical, and highly constrained aesthetics can replace generic web frameworks.

## Design Tokens
* **Typography:** {typography}
* **Color Palette:** {colors}
* **Core Layout Strategy:** Highly structural, relying on the physical constraints of the real-world object.

## Engineering & CSS Features
* {features}
* **Zero Dependencies:** Built entirely with raw HTML/CSS (via Tailwind utility classes) without heavy JS frameworks.
* **Responsive:** Designed to scale beautifully from mobile viewports up to desktop resolutions.

## Reusability Guide
To repurpose this design system for other projects:
1. **Extract the HTML structure:** The core layout constraints are baked into the wrapper `div`s.
2. **Copy the custom CSS:** Any custom `<style>` blocks in the `head` are critical for the specific aesthetic (e.g., filters, gradients, clip-paths).
3. **Swap the content:** The data (text, images) is decoupled from the styling. Replace the text and image `src` attributes to apply this aesthetic to new content.
"""

base_dir = "/home/azzar/Desktop/hbd-elis"

for folder, data in designs.items():
    folder_path = os.path.join(base_dir, folder)
    if os.path.isdir(folder_path):
        md_content = template.format(**data)
        with open(os.path.join(folder_path, "design.md"), "w") as f:
            f.write(md_content)
        print(f"Created design.md in {folder}")

