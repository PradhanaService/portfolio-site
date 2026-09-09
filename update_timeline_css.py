import re

with open('styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update timeline-item opacity from 0.4 to 0.2
content = re.sub(
    r'\.timeline-item \{\s*position: relative;\s*padding-bottom: 40px;\s*opacity: 0\.4;\s*transition: opacity 0\.4s ease;\s*text-align: left;\s*\}',
    r'.timeline-item {\n  position: relative;\n  padding-bottom: 40px;\n  opacity: 0.2;\n  transition: opacity 0.4s ease;\n  text-align: left;\n}',
    content
)

# 2. Insert .timeline-content styles right before .timeline-step
new_content_css = """
.timeline-content {
  padding: 16px 24px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  transform: scale(1);
  transform-origin: left center;
  transition: all 0.4s ease-out;
}

.timeline-item.active .timeline-content {
  border-color: rgba(120, 169, 255, 0.25);
  background: rgba(17, 24, 43, 0.6);
  transform: scale(1.025);
}

.timeline-step {"""

content = content.replace('.timeline-step {', new_content_css)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated timeline content CSS")
