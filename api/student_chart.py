import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from io import BytesIO

import matplotlib

matplotlib.use('Agg')

import matplotlib.pyplot as plt
import pandas as pd


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length < 2 or length > 32_768:
                self.send_error(413, 'Chart data is too large')
                return

            payload = json.loads(self.rfile.read(length))
            rounds = payload.get('rounds', [])
            categories = payload.get('categories', [])
            if not isinstance(rounds, list) or len(rounds) > 12 or not isinstance(categories, list) or len(categories) > 8:
                self.send_error(400, 'Invalid chart data')
                return

            round_frame = pd.DataFrame(rounds)
            category_frame = pd.DataFrame(categories)
            figure, (trend_axis, skill_axis) = plt.subplots(1, 2, figsize=(10, 4.2))
            figure.patch.set_facecolor('#ffffff')

            if not round_frame.empty and {'index', 'accuracy'}.issubset(round_frame.columns):
                round_frame['accuracy'] = pd.to_numeric(round_frame['accuracy'], errors='coerce').clip(0, 100)
                round_frame = round_frame.dropna(subset=['accuracy'])
                trend_axis.plot(round_frame['index'], round_frame['accuracy'], color='#3d9c73', marker='o', linewidth=2.8, markersize=6)
                trend_axis.set_ylim(0, 105)
                trend_axis.set_xticks(round_frame['index'])
                trend_axis.set_xlabel('Recent round')
                trend_axis.set_ylabel('Correct answers (%)')
                trend_axis.set_title('Accuracy over recent rounds', loc='left', weight='bold', color='#26384c')
                trend_axis.grid(axis='y', alpha=0.18)
            else:
                trend_axis.text(0.5, 0.5, 'Complete a round to see progress', ha='center', va='center', color='#758493')
                trend_axis.set_title('Accuracy over recent rounds', loc='left', weight='bold', color='#26384c')

            if not category_frame.empty and {'label', 'accuracy'}.issubset(category_frame.columns):
                category_frame['accuracy'] = pd.to_numeric(category_frame['accuracy'], errors='coerce').clip(0, 100)
                category_frame = category_frame.dropna(subset=['accuracy']).sort_values('accuracy')
                bars = skill_axis.barh(category_frame['label'], category_frame['accuracy'], color='#76b8d3', height=0.62)
                skill_axis.set_xlim(0, 105)
                skill_axis.set_xlabel('Correct answers (%)')
                skill_axis.set_title('Accuracy by exercise', loc='left', weight='bold', color='#26384c')
                skill_axis.grid(axis='x', alpha=0.18)
                skill_axis.bar_label(bars, fmt='%.0f%%', padding=4, fontsize=8, color='#526477')
            else:
                skill_axis.text(0.5, 0.5, 'Exercise details will appear here', ha='center', va='center', color='#758493')
                skill_axis.set_title('Accuracy by exercise', loc='left', weight='bold', color='#26384c')

            for axis in (trend_axis, skill_axis):
                axis.spines[['top', 'right', 'left']].set_visible(False)
                axis.spines['bottom'].set_color('#dce4e8')
                axis.tick_params(colors='#6d7e8c', labelsize=8)
                axis.set_facecolor('#ffffff')
            figure.tight_layout(pad=2.2)
            image = BytesIO()
            figure.savefig(image, format='png', dpi=150, bbox_inches='tight', facecolor='white')
            plt.close(figure)

            self.send_response(200)
            self.send_header('Content-Type', 'image/png')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(image.tell()))
            self.end_headers()
            self.wfile.write(image.getvalue())
        except (ValueError, TypeError, json.JSONDecodeError):
            self.send_error(400, 'Invalid chart data')
        except Exception:
            self.send_error(500, 'Unable to render chart')


if __name__ == '__main__':
    print('Python student chart service listening on http://127.0.0.1:8001')
    HTTPServer(('127.0.0.1', 8001), handler).serve_forever()
