#!/usr/bin/env python3
"""
FlipLink Backend Server
Provides an API endpoint to fetch Open Graph metadata for any URL.
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import requests
from urllib.parse import urlparse
import re

app = Flask(__name__, static_folder='.')
CORS(app)

def extract_og_tags(html, url):
    """Extract Open Graph metadata from HTML."""
    # Parse basic meta tags
    og_tags = {}
    
    # OG title
    title_match = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if not title_match:
        title_match = re.search(r'<meta\s+content=["\']([^"\']*)["\']\s+property=["\']og:title["\']', html, re.IGNORECASE)
    if not title_match:
        title_match = re.search(r'<title>([^<]*)</title>', html, re.IGNORECASE)
    og_tags['title'] = title_match.group(1) if title_match else urlparse(url).netloc
    
    # OG description
    desc_match = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if not desc_match:
        desc_match = re.search(r'<meta\s+content=["\']([^"\']*)["\']\s+property=["\']og:description["\']', html, re.IGNORECASE)
    if not desc_match:
        desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    og_tags['description'] = desc_match.group(1) if desc_match else ''
    
    # OG image
    img_match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if not img_match:
        img_match = re.search(r'<meta\s+content=["\']([^"\']*)["\']\s+property=["\']og:image["\']', html, re.IGNORECASE)
    image_url = img_match.group(1) if img_match else ''
    
    # Resolve relative URLs
    if image_url and not image_url.startswith(('http://', 'https://')):
        parsed_url = urlparse(url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        if image_url.startswith('/'):
            image_url = base_url + image_url
        else:
            image_url = base_url + '/' + image_url
    
    og_tags['image'] = image_url
    
    return og_tags

@app.route('/api/preview', methods=['GET'])
def get_preview():
    """Fetch and parse Open Graph metadata for a given URL."""
    url = request.args.get('url')
    
    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400
    
    # Normalize URL
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        # Fetch the URL with a reasonable timeout
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        response.raise_for_status()
        
        # Extract Open Graph tags
        og_tags = extract_og_tags(response.text, url)
        
        return jsonify({
            'success': True,
            'data': og_tags
        })
        
    except requests.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Failed to fetch URL: {str(e)}'
        }), 500

@app.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files."""
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
