import sys
import os
import re


def main():
    if len(sys.argv) < 2:
        print("Usage: python combine_demo.py <file1> <file2> ...")
        sys.exit(1)

    files = sys.argv[1:]

    html_file = None
    css_files = []
    js_files = []

    for f in files:
        if f.endswith(".html"):
            html_file = f
        elif f.endswith(".css"):
            css_files.append(f)
        elif f.endswith(".js"):
            js_files.append(f)

    if not html_file:
        print("Error: No HTML file provided")
        sys.exit(1)

    with open(html_file, "r") as f:
        html_content = f.read()

    for css_file in css_files:
        css_name = re.escape(os.path.basename(css_file))
        with open(css_file, "r") as f:
            css_content = f.read()
        pattern = r'<link[^>]*href=["\'][^"\']*' + css_name + r'["\'][^>]*/?\s*>'
        replacement = "<style>\n" + css_content + "\n    </style>"
        html_content = re.sub(pattern, replacement, html_content)

    for js_file in js_files:
        js_name = re.escape(os.path.basename(js_file))
        with open(js_file, "r") as f:
            js_content = f.read()
        pattern = r'<script[^>]*src=["\'][^"\']*' + js_name + r'["\'][^>]*>\s*</script>'
        replacement = "<script>\n" + js_content + "\n    </script>"
        html_content = re.sub(pattern, replacement, html_content)

    base_name = os.path.splitext(html_file)[0]
    output_file = base_name + "_DEMO.html"

    with open(output_file, "w") as f:
        f.write(html_content)

    print("Created: " + output_file)


if __name__ == "__main__":
    main()
