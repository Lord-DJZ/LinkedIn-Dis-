---
name: ui-superpowers
description: Curated AI MCP servers, GitHub repositories, and design-engine superpowers for building world-class web applications, Neumorphic UI, and Claude-grade aesthetic experiences.
---

# UI & Web Creation Superpowers: MCPs & GitHub Toolkits

This skill provides an authoritative catalog and design engine specification for building human-grade, non-AI-looking web applications.

## 1. Top AI MCP Servers for UI & Web Creation

### A. Visual Rendering & Browser Inspection MCPs
1. **`@modelcontextprotocol/server-puppeteer`** (Official Anthropic MCP)
   - *Repository*: `github.com/modelcontextprotocol/servers/tree/main/src/puppeteer`
   - *Superpower*: Headless browser automation, visual screenshots, element bounding box extraction, console inspection.
2. **`playwright-mcp`**
   - *Repository*: `github.com/executeautomation/mcp-playwright`
   - *Superpower*: Full cross-browser emulation (Chromium, Firefox, WebKit), high-DPI retina screenshots, responsive breakpoint testing.
3. **`mcp-chrome-devtools`**
   - *Superpower*: Live performance auditing, layout shift detection, CSS computed style evaluation.

### B. UI Component & Design System MCPs
4. **`shadcn-ui-mcp` / `mcp-radix`**
   - *Repository*: `github.com/shadcn/ui`
   - *Superpower*: On-demand pulling of unstyled, accessible Radix UI primitives with zero external stylesheet lock-in.
5. **`magicui` MCP / Skills Engine**
   - *Superpower*: Tactile micro-interactions (bento grids, border-beams, particles, smooth springs).
6. **`lucide-icons` Toolset**
   - *Superpower*: Consistent 24x24 vector stroke icons avoiding distorted or hallucinated SVGs.

---

## 2. Neumorphic & Claude AI Design Engine Tokens

### Principles of Non-AI, Native UI:
- **No Cheesy Transparencies**: Avoid blurry, generic glassmorphism gradients on interactive elements.
- **Solid High-Trust Buttons**: Deep solid fills (e.g. `#0B0C10` or `#121316`), crisp white typography, `rounded-full` capsule geometry, and subtle physical drop shadows.
- **Physical Elevation**: Dual-shadow elevation for cards:
  ```css
  box-shadow: 6px 6px 18px rgba(185, 175, 160, 0.16), -4px -4px 14px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(0, 0, 0, 0.04);
  ```
- **Claude AI Palette**:
  - Canvas: `#FAF7F2` (Warm stone/ivory, anti-glare).
  - Surface: `#FFFFFF` (Elevated cards).
  - Inset: `#F4EFEA` (Inputs & sunken pills).
  - Border: `#E8E2D9` (Warm stone hairline).
  - Primary Accent: `#CC5A2B` (Warm terracotta).
  - Primary Text: `#1F1E1D` (Deep warm charcoal).
