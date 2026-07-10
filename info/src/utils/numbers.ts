import numbro from 'numbro'

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number | undefined, digits = 3, round = true) => {
  if (num === 0) return '$0.00'
  if (!num) return '-'
  if (num < 0.001 && digits <= 3) {
    return '<$0.001'
  }

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}

// using a currency library here in case we want to add more in future
export const formatAmount = (num: number | undefined, digits = 2) => {
  if (num === 0) return '0'
  if (!num) return '-'
  if (num < 0.001) {
    return '<0.001'
  }
  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}

/** 与 Swap 个人仓位 `toSignificant(4)` 对齐的代币数量展示 */
export const formatTokenAmount = (num: number | undefined, sigFigs = 4): string => {
  if (num === 0) return '0'
  if (!num) return '-'

  const abs = Math.abs(num)
  if (abs < 1e-5) return '<0.00001'
  if (abs < 1) return parseFloat(num.toPrecision(sigFigs)).toString()

  return formatAmount(num)
}
