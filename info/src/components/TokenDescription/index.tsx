import React, { useEffect, useState } from 'react'
import { DarkGreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { fetchTokenDescription } from '../../lib/sanity/queries' //CMS query to fetch token description
import { useTranslation } from 'react-i18next'

interface TokenDescriptionProps {
  tokenAddress: string | undefined
}

const TokenDescription: React.FC<TokenDescriptionProps> = ({ tokenAddress }) => {
  const [description, setDescription] = useState<string | null>(null)
  const { t } = useTranslation()
  useEffect(() => {
    if (!tokenAddress) return

    const fetchDescription = async () => {
      try {
        const data = await fetchTokenDescription(tokenAddress)
        setDescription(data?.description ?? t('noDescriptionFound'))
      } catch (error) {
        console.log(error,'是什么')
        console.error('Failed to fetch token description:', error)
        // console.log(t('errorLoadingDescription'),'是什么')
        setDescription(t('noDescriptionFound'))
      }
    }

    fetchDescription()
  }, [tokenAddress])

  if (!tokenAddress) return null

  return (
    <DarkGreyCard style={{ height: "100%", background: "#0D0D0D" }}>
      <AutoColumn $gap="8px">
        {/* <TYPE.main fontSize="20px">About This Token</TYPE.main> */}
        <TYPE.body color={'#7E98A7'}>{description ?? t('loadingDescription')}</TYPE.body>
      </AutoColumn>
    </DarkGreyCard>
  )
}

export default TokenDescription
