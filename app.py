from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import time
import logging

# Import your existing Google Sheets manager
# from data.test_data_manager import GoogleSheetsManager

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Google Sheets Manager
# gs_manager = GoogleSheetsManager()

# Your Google Sheet ID
SHEET_ID = "1dYeok-Dy_7a03AhPDLV2NNmGbRNoCD3q0zaAHPwxxCE"

# Mock data for testing (replace with actual Google Sheets call)
def get_mock_orders():
    return [
        {
            'id': 'ORD-2025-001',
            'booth_number': 'A-245',
            'exhibitor_name': 'TechFlow Innovations',
            'item': 'Premium Booth Setup Package',
            'description': 'Complete booth installation with premium furniture, lighting, and tech setup',
            'color': 'White',
            'quantity': 1,
            'status': 'out-for-delivery',
            'order_date': 'June 14, 2025',
            'comments': 'Rush delivery requested',
            'section': 'Section A'
        },
        {
            'id': 'ORD-2025-002',
            'booth_number': 'A-245',
            'exhibitor_name': 'TechFlow Innovations',
            'item': 'Interactive Display System',
            'description': '75" 4K touchscreen display with interactive software and mounting',
            'color': 'Black',
            'quantity': 1,
            'status': 'in-route',
            'order_date': 'June 13, 2025',
            'comments': '',
            'section': 'Section A'
        },
        {
            'id': 'ORD-2025-003',
            'booth_number': 'B-156',
            'exhibitor_name': 'GreenWave Energy',
            'item': 'Marketing Materials Bundle',
            'description': 'Banners, brochures, business cards, and promotional items',
            'color': 'Green',
            'quantity': 5,
            'status': 'delivered',
            'order_date': 'June 12, 2025',
            'comments': 'Eco-friendly materials requested',
            'section': 'Section B'
        },
        {
            'id': 'ORD-2025-004',
            'booth_number': 'C-089',
            'exhibitor_name': 'SmartHealth Corp',
            'item': 'Audio-Visual Equipment',
            'description': 'Professional sound system, microphones, and presentation equipment',
            'color': 'White',
            'quantity': 1,
            'status': 'in-process',
            'order_date': 'June 14, 2025',
            'comments': 'Medical grade equipment required',
            'section': 'Section C'
        }
    ]

def load_orders_from_sheets():
    """Load orders from Google Sheets - replace mock data with actual implementation"""
    try:
        # Uncomment and modify this when ready to connect to real sheets
        # orders_df = gs_manager.get_data(SHEET_ID, "Orders")
        # 
        # # Clean the data (based on your existing code)
        # orders_df.columns = orders_df.iloc[0].str.strip()
        # orders_df = orders_df[1:].reset_index(drop=True)
        # 
        # # Convert to list of dictionaries
        # orders = []
        # for _, row in orders_df.iterrows():
        #     orders.append({
        #         'id': f"ORD-{row.get('Date', '')}-{row.get('Booth #', '')}",
        #         'booth_number': str(row.get('Booth #', '')),
        #         'exhibitor_name': row.get('Exhibitor Name', ''),
        #         'item': row.get('Item', ''),
        #         'color': row.get('Color', ''),
        #         'quantity': row.get('Quantity', 1),
        #         'status': map_status(row.get('Status', '')),
        #         'order_date': row.get('Date', ''),
        #         'comments': row.get('Comments', ''),
        #         'section': row.get('Section', '')
        #     })
        # 
        # return orders
        
        # For now, return mock data
        return get_mock_orders()
        
    except Exception as e:
        logger.error(f"Error loading orders from sheets: {e}")
        return get_mock_orders()

def map_status(sheet_status):
    """Map Google Sheets status to React app status"""
    status_mapping = {
        'Delivered': 'delivered',
        'Received': 'delivered',
        'Out for delivery': 'out-for-delivery',
        'In route from warehouse': 'in-route',
        'In Process': 'in-process',
        'cancelled': 'cancelled'
    }
    return status_mapping.get(sheet_status, 'in-process')

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/exhibitors', methods=['GET'])
def get_exhibitors():
    """Get list of all exhibitors"""
    orders = load_orders_from_sheets()
    exhibitors = {}
    
    for order in orders:
        exhibitor_name = order['exhibitor_name']
        booth_number = order['booth_number']
        
        if exhibitor_name not in exhibitors:
            exhibitors[exhibitor_name] = {
                'name': exhibitor_name,
                'booth': booth_number,
                'total_orders': 0,
                'delivered_orders': 0
            }
        
        exhibitors[exhibitor_name]['total_orders'] += 1
        if order['status'] == 'delivered':
            exhibitors[exhibitor_name]['delivered_orders'] += 1
    
    return jsonify(list(exhibitors.values()))

@app.route('/api/orders', methods=['GET'])
def get_all_orders():
    """Get all orders"""
    orders = load_orders_from_sheets()
    return jsonify(orders)

@app.route('/api/orders/exhibitor/<exhibitor_name>', methods=['GET'])
def get_orders_by_exhibitor(exhibitor_name):
    """Get orders for a specific exhibitor"""
    orders = load_orders_from_sheets()
    exhibitor_orders = [order for order in orders if order['exhibitor_name'] == exhibitor_name]
    
    return jsonify({
        'exhibitor': exhibitor_name,
        'orders': exhibitor_orders,
        'total_orders': len(exhibitor_orders),
        'delivered_orders': len([o for o in exhibitor_orders if o['status'] == 'delivered']),
        'last_updated': datetime.now().isoformat()
    })

@app.route('/api/orders/booth/<booth_number>', methods=['GET'])
def get_orders_by_booth(booth_number):
    """Get orders for a specific booth"""
    orders = load_orders_from_sheets()
    booth_orders = [order for order in orders if order['booth_number'] == booth_number]
    
    return jsonify({
        'booth': booth_number,
        'orders': booth_orders,
        'total_orders': len(booth_orders),
        'last_updated': datetime.now().isoformat()
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics"""
    orders = load_orders_from_sheets()
    
    stats = {
        'total_orders': len(orders),
        'delivered': len([o for o in orders if o['status'] == 'delivered']),
        'in_process': len([o for o in orders if o['status'] == 'in-process']),
        'in_route': len([o for o in orders if o['status'] == 'in-route']),
        'out_for_delivery': len([o for o in orders if o['status'] == 'out-for-delivery']),
        'cancelled': len([o for o in orders if o['status'] == 'cancelled']),
        'last_updated': datetime.now().isoformat()
    }
    
    return jsonify(stats)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
