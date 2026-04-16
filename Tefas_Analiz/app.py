import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import os
from datetime import datetime, timedelta

# Page config for a premium look
st.set_page_config(page_title="TEFAS Advanced Analytics 🚀", layout="wide", initial_sidebar_state="expanded")

# Custom CSS for better aesthetics
st.markdown("""
<style>
    .main { background-color: #f8f9fa; }
    .stMetric {
        background-color: #ffffff;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

def calculate_metrics(df, risk_free_rate=0.45):
    # Daily returns
    df['returns'] = df['price'].pct_change()
    
    # Yearly metrics calculation
    days = len(df)
    total_return = (df['price'].iloc[-1] / df['price'].iloc[0]) - 1
    ann_return = ((1 + total_return) ** (252 / days)) - 1 if days > 0 else 0
    
    # Std Dev (Annualized)
    std_dev = df['returns'].std() * np.sqrt(252)
    
    # Sharpe Ratio (Assuming RF Rate)
    sharpe = (ann_return - risk_free_rate) / std_dev if std_dev != 0 else 0
    
    # Sortino Ratio (Downside risk only)
    downside_returns = df[df['returns'] < 0]['returns']
    downside_std = downside_returns.std() * np.sqrt(252)
    sortino = (ann_return - risk_free_rate) / downside_std if downside_std != 0 else 0
    
    # Max Drawdown
    rolling_max = df['price'].cummax()
    drawdown = (df['price'] - rolling_max) / rolling_max
    max_drawdown = drawdown.min()
    current_drawdown = drawdown.iloc[-1]
    
    # Negative days
    neg_days = len(df[df['returns'] < 0])
    neg_days_ratio = (neg_days / days) * 100
    
    return {
        "Total Return": total_return * 100,
        "Std Dev": std_dev * 100,
        "Sharpe": sharpe,
        "Sortino": sortino,
        "Max Drawdown": max_drawdown * 100,
        "Current DD": current_drawdown * 100,
        "Neg Days Ratio": neg_days_ratio,
        "Neg Days": neg_days
    }

@st.cache_data
def load_data(fund_code):
    file_path = f"{fund_code}_1year_daily_data.xlsx"
    if not os.path.exists(file_path):
        return None
    df = pd.read_excel(file_path)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    return df

try:
    # Sidebar
    st.sidebar.image("https://www.tefas.gov.tr/Content/img/tefas_logo.png", width=200)
    st.sidebar.markdown("---")
    
    selected_fund = st.sidebar.text_input("Analiz Edilecek Fon Kodu", "AFT").upper()
    
    df = load_data(selected_fund)
    
    if df is not None:
        fund_code = df['code'].iloc[0]
        metrics = calculate_metrics(df)

        st.title(f"🚀 TEFAS Profesyonel Fon Analizi")
        st.subheader(f"{fund_code} - Performans ve Risk Karnesi")

        # Metrics Section 1: Returns & Volatility
        m_col1, m_col2, m_col3, m_col4 = st.columns(4)
        m_col1.metric("Toplam Getiri (Yıl)", f"%{metrics['Total Return']:.2f}")
        m_col2.metric("Oynaklık (Std. Sapma)", f"%{metrics['Std Dev']:.2f}")
        m_col3.metric("Sharpe Oranı", f"{metrics['Sharpe']:.2f}")
        m_col4.metric("Sortino Oranı", f"{metrics['Sortino']:.2f}")

        # Metrics Section 2: Drawdown & Stability
        m2_col1, m2_col2, m2_col3, m2_col4 = st.columns(4)
        m2_col1.metric("Max Kayıp (Drawdown)", f"%{metrics['Max Drawdown']:.2f}", delta_color="inverse")
        m2_col2.metric("Zirveye Uzaklık", f"%{abs(metrics['Current DD']):.2f}")
        m2_col3.metric("Negatif Gün Oranı", f"%{metrics['Neg Days Ratio']:.1f}")
        m2_col4.metric("Kayıtlı İşlem Günü", f"{len(df)}")

        # Charts
        st.markdown("---")
        c1, c2 = st.columns([2, 1])

        with c1:
            st.markdown("### 📈 Fiyat ve Kayıp Analizi")
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=df['date'], y=df['price'], name="Birim Fiyat", line=dict(color='#1f77b4', width=3)))
            fig.update_layout(template="plotly_white", hovermode="x unified", height=500)
            st.plotly_chart(fig, use_container_width=True)

        with c2:
            st.markdown("### 📊 Getiri Dağılımı")
            fig_hist = px.histogram(df, x="returns", nbins=50, title="Günlük Getiri Dağılımı", template="plotly_white")
            fig_hist.update_layout(showlegend=False, height=500)
            st.plotly_chart(fig_hist, use_container_width=True)

        # Worst Days Section
        st.markdown("---")
        st.markdown("### ⚠️ En Büyük Günlük Kayıplar (Kritik Günler)")
        
        # Calculate daily change and find the worst ones
        worst_days = df.nsmallest(5, 'returns')[['date', 'price', 'returns']].copy()
        worst_days['returns'] = worst_days['returns'] * 100 # Convert to percentage
        worst_days.columns = ['Tarih', 'Birim Fiyat', 'Günlük Değişim (%)']
        
        col_worst1, col_worst2 = st.columns([1, 1])
        with col_worst1:
            st.write("Fonun bir gün önceye göre en çok değer kaybettiği 5 gün:")
            st.dataframe(worst_days.style.format({'Günlük Değişim (%)': '{:.2f}%', 'Birim Fiyat': '{:.6f}'}), use_container_width=True)
            
        with col_worst2:
            st.info("""
            **Analiz Notu:** Bu tablo, fonun 'Maksimum Kayıp' (Drawdown) sürecindeki en kritik kırılma anlarını gösterir. 
            Buradaki yüzdeler, o günkü fiyatın bir önceki işlem gününe göre ne kadar düştüğünü ifade eder.
            """)

        # Comparison Table
        st.markdown("### 📋 PDF Formatında Risk/Getiri Tablosu")
        comparison_data = {
            "Metrik": ["Yıllık Getiri", "Std. Sapma", "Sharpe Oranı", "Sortino Oranı", "Maks. Kayıp", "Negatif Gün %"],
            f"{fund_code} Değerleri": [
                f"%{metrics['Total Return']:.2f}", 
                f"%{metrics['Std Dev']:.2f}", 
                f"{metrics['Sharpe']:.2f}", 
                f"{metrics['Sortino']:.2f}", 
                f"%{metrics['Max Drawdown']:.2f}", 
                f"%{metrics['Neg Days Ratio']:.1f}"
            ]
        }
        st.table(pd.DataFrame(comparison_data))
    else:
        st.warning(f"{selected_fund} için yerel veri bulunamadı. Lütfen önce 'crawl_aft_to_excel.py' scriptini çalıştırarak veriyi çekin.")

except Exception as e:
    st.error(f"Hata: {e}")
