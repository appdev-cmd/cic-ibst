import React from 'react';
import type { DashboardData, DashboardFilter } from '../../services/dashboardService';
import type { DashboardDrilldownTab } from '../../components/DashboardDetailSlidePanel';

export interface DashboardComponentProps {
  data: DashboardData;
  onOpenDrilldown: (tab: DashboardDrilldownTab) => void;
  filter: DashboardFilter;
  isMeetingMode?: boolean;
}

export const DASHBOARD_COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
  '#84cc16', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#e11d48', '#10b981', '#6366f1',
];

export const DASHBOARD_DEBT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#6366f1', '#0ea5e9', '#e11d48', '#d97706',
];

export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-default)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  labelStyle: {
    color: 'var(--text-primary)',
    fontWeight: 'bold',
  },
  itemStyle: {
    color: 'var(--text-secondary)',
  },
};
