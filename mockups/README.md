# RunThru HTML Mockups

Quick iteration playground for UI/UX experiments. No build process - just HTML, Tailwind CDN, and a browser!

## 🚀 Quick Start

1. **Open index.html** in your browser:
   ```bash
   cd mockups
   open index.html  # or just double-click
   ```

2. **Pick a page to iterate on** (or create a new one)

3. **Edit HTML** directly in your editor

4. **Refresh browser** (F5) to see changes instantly

## 📁 File Structure

- `index.html` - Directory listing (start here)
- `script-detail-v1.html` - Current design (reference)
- `script-detail-v2.html` - Blank template (experiment here)
- `rehearsal-player-v1.html` - Sprint 5 concept
- `_template.html` - Blank starter template

## 🎨 Design System

All mockups use Tailwind CDN configured with our dark mode colors:

```javascript
colors: {
  background: "hsl(240 10% 3.9%)",
  foreground: "hsl(0 0% 98%)",
  border: "hsl(240 3.7% 15.9%)",
  muted: "hsl(240 5% 64.9%)",
}
```

**Accent Colors**:
- Amber (`amber-500`) - User/primary actions
- Cyan (`cyan-400`) - AI characters
- Purple (`purple-400`) - Secondary elements
- Pink (`pink-400`) - Tertiary accents

## 🔄 Iteration Workflow

1. **Copy v1** → Save as v2, v3, etc.
2. **Experiment** with layout/colors/copy
3. **Compare versions** side-by-side in browser tabs
4. **Get feedback** from user/teen
5. **Once approved** → Copy HTML to React component

## 📋 Why This Approach?

- **Fast**: No npm install, no build step, no webpack
- **Same classes**: Tailwind classes copy directly to React
- **Version control**: Git tracks all versions
- **Side-by-side**: Open multiple versions in tabs to compare
- **Teen testing**: Send file:// link, get instant feedback
- **Throwaway**: Experiment wildly without breaking app

## 💡 Tips

- Use browser DevTools to tweak styles live
- Take screenshots for comparison
- Test on mobile (Chrome DevTools responsive mode)
- Copy/paste between versions freely
- Add data-* attributes for later interactivity planning

## 📝 Versioning Convention

- **v1** = Current design (reference only, don't edit)
- **v2** = First iteration
- **v3** = Second iteration
- **final** = Approved design (copy to React)

## 🎯 Next Steps After Approval

```bash
# Copy HTML structure to React component
# Replace <div> with shadcn components where applicable
# Add state management and event handlers
# Test in real app
```

---

**Remember**: These are throwaway experiments! Don't overthink it - iterate fast, get feedback, move on.
