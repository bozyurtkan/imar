from tefas import Crawler
import pandas as pd
from datetime import datetime, timedelta
import os

def crawl_and_export(fund_code):
    print(f"Crawling data for {fund_code} using tefas-crawler...")
    
    # Calculate dates
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    # Initialize crawler
    tefas = Crawler()
    
    all_data = []
    current_start = start_date
    
    while current_start < end_date:
        current_end = min(current_start + timedelta(days=30), end_date)
        print(f"Fetching: {current_start.strftime('%Y-%m-%d')} to {current_end.strftime('%Y-%m-%d')}...")
        
        try:
            data = tefas.fetch(
                start=current_start.strftime("%Y-%m-%d"),
                end=current_end.strftime("%Y-%m-%d"),
                name=fund_code
            )
            if not data.empty:
                all_data.append(data)
        except Exception as e:
            print(f"Error fetching chunk {current_start.strftime('%Y-%m-%d')}: {e}")
        
        current_start = current_end + timedelta(days=1)
    
    if not all_data:
        print(f"No data found for {fund_code} in the specified period.")
        return

    # Combine all chunks
    df = pd.concat(all_data).drop_duplicates().sort_values(by="date")
    
    # Export to Excel
    filename = f"{fund_code}_1year_daily_data.xlsx"
    df.to_excel(filename, index=False)
    
    print(f"\nData successfully exported to {filename}")
    print(f"Total records: {len(df)}")
    
    return filename

if __name__ == "__main__":
    # Fetching both AFT and TLY as requested
    for fund in ["AFT", "TLY"]:
        crawl_and_export(fund)
