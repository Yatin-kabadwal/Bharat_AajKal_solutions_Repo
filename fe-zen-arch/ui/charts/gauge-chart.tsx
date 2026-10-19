import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface SingleGaugeData {
  value: number
  maxValue?: number
  unit?: string
  warningThreshold?: number
  criticalThreshold?: number
  reverseColors?: boolean
}

interface MultiGaugeData {
  label: string
  value: number
  color: string
  maxValue?: number
}

interface GaugeChartProps {
  data: SingleGaugeData | MultiGaugeData[]
  type: 'single' | 'multi'
  maxValue?: number
}

export function GaugeChart({ data, type, maxValue = 100 }: GaugeChartProps) {
  const isSingle = type === 'single'
  const singleData = isSingle ? (data as SingleGaugeData) : null
  const multiData = !isSingle ? (data as MultiGaugeData[]) : null

  function getSingleColor(value: number, config: SingleGaugeData) {
    const { warningThreshold = 70, criticalThreshold = 90, reverseColors = false } = config

    if (reverseColors) {
      if (value <= 20) return '#10b981'
      if (value <= 50) return '#f59e0b'
      return '#ef4444'
    } else {
      if (value >= criticalThreshold) return '#ef4444'
      if (value >= warningThreshold) return '#f59e0b'
      return '#10b981'
    }
  }

  function getSingleStatus(value: number, config: SingleGaugeData) {
    const { warningThreshold = 70, criticalThreshold = 90, reverseColors = false } = config

    if (reverseColors) {
      if (value <= 20) return 'Excellent'
      if (value <= 50) return 'Good'
      return 'Poor'
    } else {
      if (value >= criticalThreshold) return 'Critical'
      if (value >= warningThreshold) return 'Warning'
      return 'Good'
    }
  }

  function formatValue(value: number) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return value.toFixed(2)
  }

  function renderSingleGauge() {
    if (!singleData) return null

    const percentage = (singleData.value / (singleData.maxValue ?? maxValue)) * 100
    const gaugeColor = getSingleColor(singleData.value, singleData)
    const status = getSingleStatus(singleData.value, singleData)

    const chartData = {
      datasets: [
        {
          data: [percentage, 100 - percentage],
          backgroundColor: [gaugeColor, '#f3f4f6'],
          borderWidth: 0,
          cutout: '75%',
          circumference: 180,
          rotation: 270
        }
      ]
    }

    return (
      <>
        <div className="relative h-24">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <div className="text-lg font-semibold" style={{ color: gaugeColor }}>
              {formatValue(singleData.value)}
            </div>
          </div>
        </div>
        <div className="text-center">
          <span className="text-xs font-medium" style={{ color: gaugeColor }}>
            {status}
          </span>
        </div>
      </>
    )
  }

  function renderMultiGauge() {
    if (!multiData || multiData.length === 0) return null

    const datasets = multiData.map((item, index) => {
      const percentage = (item.value / (item.maxValue ?? maxValue)) * 100
      const cutoutPercentage = 85 - index * 15

      return {
        data: [percentage, 100 - percentage],
        backgroundColor: [item.color, '#f3f4f6'],
        borderWidth: 0,
        cutout: `${cutoutPercentage}%`,
        circumference: 180,
        rotation: 270
      }
    })

    const chartData = { datasets }

    return (
      <>
        <div className="relative h-24">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
            <div className="space-y-1 text-center text-xs font-medium">
              {multiData.map((item, index) => (
                <div key={index} className="flex items-center justify-center space-x-1">
                  <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{formatValue(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          {multiData.map((item, index) => (
            <span key={index}>{item.label}</span>
          ))}
        </div>
      </>
    )
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  }

  return isSingle ? renderSingleGauge() : renderMultiGauge()
}
