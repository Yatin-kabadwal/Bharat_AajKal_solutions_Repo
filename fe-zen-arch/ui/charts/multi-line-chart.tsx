/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import { useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { formatTimestamp } from './utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface DataSeries {
  label: string
  data: { timestamp: number; value: number }[]
  color: string
  fill?: boolean
}

export interface MultiLineChartProps {
  series: DataSeries[]
  height?: number
  showLegend?: boolean
}

export function MultiLineChart({ series, height = 300, showLegend = true }: MultiLineChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  const allTimestamps = [...new Set(series.flatMap((s) => s.data.map((d) => d.timestamp)))].sort()

  const chartData = {
    labels: allTimestamps.map(formatTimestamp),
    datasets: series.map((s) => ({
      label: s.label,
      data: allTimestamps.map((timestamp) => {
        const dataPoint = s.data.find((d) => d.timestamp === timestamp)
        return dataPoint ? dataPoint.value : null
      }),
      borderColor: s.color,
      backgroundColor: s.fill ? `${s.color}20` : 'transparent',
      borderWidth: 2,
      fill: s.fill ?? false,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: s.color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      spanGaps: true
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12 },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: (context: any) => {
            const timestamp = allTimestamps[context[0].dataIndex]
            const date = new Date(timestamp)
            return date.toLocaleString()
          },
          label: (context: any) => {
            const value = context.parsed.y
            const label = context.dataset.label
            return `${label}: ${value.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: true, color: '#f3f4f6' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          maxTicksLimit: 8
        },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { display: true, color: '#f3f4f6' },
        ticks: { color: '#6b7280', font: { size: 11 } },
        border: { display: false }
      }
    }
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}
