/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

interface ChartProps {
  data: { timestamp: number; value: number }[]
  color?: string
  height?: number
  yAxisLabel?: string
  showPoints?: boolean
  fill?: boolean
}

export function LineChart({
  data,
  color = '#3b82f6',
  height = 200,
  yAxisLabel = 'Value',
  showPoints = false,
  fill = true
}: ChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  const chartData = {
    labels: data.map((d) => formatTimestamp(d.timestamp)),
    datasets: [
      {
        label: yAxisLabel,
        data: data.map((d) => d.value),
        borderColor: color,
        backgroundColor: fill ? `${color}20` : 'transparent',
        borderWidth: 2,
        fill: fill,
        tension: 0.4,
        pointRadius: showPoints ? 3 : 0,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex
            const timestamp = data[index].timestamp
            const date = new Date(timestamp)
            return date.toLocaleString()
          },
          label: (context: any) => {
            const value = context.parsed.y
            if (yAxisLabel === 'ms') {
              return `${value.toFixed(1)} ms`
            } else if (yAxisLabel === '%') {
              return `${value.toFixed(2)}%`
            } else if (yAxisLabel === 'Requests' || yAxisLabel === 'Connections' || yAxisLabel === 'Errors') {
              return `${Math.round(value).toLocaleString()} ${yAxisLabel.toLowerCase()}`
            }
            return `${value.toFixed(1)} ${yAxisLabel}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: true, color: '#f3f4f6' },
        ticks: { color: '#6b7280', font: { size: 11 }, maxTicksLimit: 6 },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { display: true, color: '#f3f4f6' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: function (value: any) {
            if (yAxisLabel === 'ms') {
              return `${value}ms`
            } else if (yAxisLabel === '%') {
              return `${value}%`
            } else if (typeof value === 'number' && value >= 1000) {
              return `${(value / 1000).toFixed(1)}k`
            }
            return value
          }
        },
        border: { display: false }
      }
    },
    elements: { point: { hoverBackgroundColor: color } }
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}
