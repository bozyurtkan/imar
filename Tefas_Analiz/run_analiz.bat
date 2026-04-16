@echo off
echo TEFAS Fon Verileri Guncelleniyor...
python crawl_fund_data.py
echo.
echo Dashboard Baslatiliyor...
streamlit run app.py
pause
