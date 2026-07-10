import { Trans } from '@lingui/macro'
import { SmallButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { useIsMobile } from 'nft/hooks'
import ReactMarkdown from 'react-markdown'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { ThemedText } from 'theme/components'
import { toWithPreservedRouterSearch } from 'utils/withPreservedRouterSearch'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Header = styled(Container)`
  gap: 30px;
`

const PageWrapper = styled(Container)`
  flex: 1;
  justify-content: center;
  gap: 50px;
  padding: 10px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    justify-content: space-between;
    padding-top: 64px;
  }
`
const MarkDownWrapper = styled.div`
  max-width: 1024px;
  overflow: hidden;
`

export default function PrivacyPolicy() {
  const { search } = useLocation()
  const Title = useIsMobile() ? ThemedText.LargeHeader : ThemedText.Hero
  return (
    <PageWrapper>
      <Header>
        <Container>
          <Title>DataDex Privacy Policy</Title>
        </Container>
      </Header>
      <AutoColumn gap="md">
        <MarkDownWrapper>
          <ReactMarkdown
            source={`# **DataDex Privacy Policy**

*Last Updated: December 2024*

*This Privacy Policy explains how the DataDex Foundation, its subsidiary, collects, uses, and discloses information about you. This Privacy Policy applies when you use our website, DataDex Protocol user-interface or application and other online products (collectively, our "UI"), engage with us on social media, or otherwise interact with us.*

*We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of this policy and, when material, we will provide you with additional notice by adding a statement to our website and consent as required under applicable law. Your continued use of this UI after we make changes is deemed to be acceptance of those changes when permissible. We encourage you to review this Privacy Policy regularly to stay informed about our information practices and the choices available to you.*

## **Summary**

- DataDex does not typically request, collect or use personal information. With the exception of your wallet address, there is no reason for you to provide personal information when you use the UI.
- DataDex does not and has not stored personal information from users of the UI. However, DataDex uses third party services including, without limitation, Cloudflare and Fathom Analytics who may collect and store certain user information only for use in the provision of their services.
- DataDex does not set any cookies. However, it's possible we may use third party service providers in the future that set cookies.

## **Collection of Information**

### **Information You Provide to Us**

We do not typically request, collect or use personal information from you except under limited circumstances as described herein. With the exception of your wallet address, there is no reason for you to provide personal information when you use the UI. Your use of the UI will not be customized and this policy reflects that practice.

DataDex is not directed to children under the age of 16. If a parent or guardian becomes aware that his or her child has provided us with personal information without your consent, please contact us at vanadatadex@gmail.com. If we become aware that a child under the age of 16 has provided us with personal information, we will take reasonable efforts to delete such personal information.

### **Information We Collect Automatically When You Interact With Us**

When you access or use our UI, we may automatically collect certain information, including:

- *Device and Usage Information:* We (and our service providers) collect information about how you access the UI, including data about the device and network you use, such as your hardware model, operating system version, mobile network, browser type, IP address and app version. We do not typically, but we may, also collect information about your activity on the UI, such as access times, pages viewed, links clicked, and the page you visited before navigating to the UI.
- *Information Collected by Cookies and Similar Tracking Technologies:* We do not typically use tracking technologies, such as cookies and web beacons, to collect information about you. Cookies are small data files stored on your hard drive or in device memory that help us improve the UI and your experience, see which areas and features of the UI are popular, and count visits. Web beacons (also known as "pixel tags" or "clear GIFs") are electronic images that we use on the UI to help deliver cookies, count visits, and understand usage and campaign effectiveness. For more information about cookies and how to disable them, see our [Cookies Policy](https://app.symm.fi/#/cookies-policy) and the Your Choices section below.

### **Information We Collect from Other Sources**

We do not typically obtain information from third-party sources in order to provide business services. We do not sell information we collect.

### **Information We Derive**

We may derive limited information or draw inferences about you based on the information we have access to or receive, most importantly, from our service providers. Your wallet and IP address is accessible to DataDex and its vendor(s). We may make inferences about you based on your wallet or IP address.

## **Use of Information**

We do not collect your personal information, other than wallet address, to customize the UI for your use. However, we reserve the ability to use information we collect to provide, maintain, administer and/or improve the UI. We may also use the information we collect to:

- Ensure proper functioning of DataDex and the UI;
- Provide services, content, material and other information on the UI;
- Identify and/or diagnose problems on or related to the UI;
- Send technical notices, security alerts, and support and administrative messages;
- Provide requested information, technical support and/or integrations such as an application programming interface or API;
- Respond to comments and questions;
- Analyze trends, usage, and activities in connection with the UI;
- Detect, investigate, and prevent security incidents and other malicious, deceptive, fraudulent, or illegal activity and protect the rights and property of DataDex and others;
- Debug to identify and repair errors in the UI;
- Comply with legal, regulatory and financial obligations;
- Carry out any other purpose described to you at the time the information was collected; and
- For other reasonable internal use or uses aligned with your relationship with us and the context in which we collected the information.

## **Sharing of Information**

We do not have access to or share personally identifiable information, other than as described herein, in the normal course of DataDex business. However, when DataDex has access to personal information, such as your wallet and certain IP addresses, it may share that information in the following circumstances or as otherwise described in this policy:

- We share personal information with vendors, service providers, and consultants that need access to personal information in order to perform services for us, such as transaction monitoring, data management, fraud prevention, customer service and support, marketing and/or advertising.
- If you choose to use integrations, we may share certain information with the integration partners.
- We may disclose personal information if we believe that disclosure is in accordance with, or required by, any applicable law or legal process, including lawful requests by public authorities to meet national security or law enforcement requirements.
- We may share personal information if we believe that your actions are inconsistent with our user agreements or policies, if we believe that you have violated the law, or if we believe it is necessary to protect the rights, property, and safety of DataDex, the DataDex ecosystem, the public, or others.
- We share personal information with our lawyers and other professional advisors where necessary to obtain advice or otherwise protect and manage our business interests.
- We may share personal information in connection with, or during negotiations concerning, merger, sale of company assets, financing, bankruptcy, business closure, or acquisition of all or a portion of our assets. Additionally, as part of such an event, we may transfer or sell personal information to a third party. We will provide notice to you on our UI of any such sharing to a third party and any choices you may have regarding the sharing of your personal information.
- Personal information may be shared between and among DataDex and our current and future parents, affiliates, and subsidiaries and other companies under common control and ownership ("corporate affiliates"). This information may be used to provide you with offers, services, or products that may be of interest to you and provide you with their products and services. Any such corporate affiliate may use your personal information only according to the terms of this Policy. If you are located in a jurisdiction where such sharing requires your permission, we will only share such information with your consent. If you decide you no longer wish to receive these promotional communications, please follow the instructions provided in Your Choices section below.
- We share personal information with your consent or at your direction.
- We also share aggregated or de-identified information that cannot reasonably be used to identify you.

## **Advertising and Analytics**

We do not work with third parties to serve ads to you as part of customized campaigns on the UI or third-party UIs.

## **Your Choices**

### **Cookies**

DataDex does not typically use any cookies. It reserves the ability to use them to affect the availability and functionality of the UI.

## **Additional Considerations**

In the preceding 12 months, we or our vendors may have collected the following categories of personal information: identifiers, internet or other electronic network activity information and inferences. For details about the data points we collect and the categories of sources of such collection, please see the Collection of Information section above. We collect personal information for the purposes described in the Use of Information section above. In the preceding 12 months, we have disclosed the following categories of personal information for business purposes to the following categories of recipients:

| **Category of Personal Information** | **Type of Information & Categories of Recipients** |
| --- | --- |
| Identifiers | We share with vendors, such CloudFlare and Fathom Analytics: certain IP addresses, device identifiers or other similar identifiers.
With our compliance partner, TRM Labs, we only share wallet addresses used to connect a wallet to our UI (all other user information like IP addresses, device identifiers and location are not shared). The code for the UI is open source, and can be reviewed by anyone at any time. |
| Internet or other electronic network activity information | We share with vendors: information regarding an interaction with an UI/website |

DataDex does not "sell" personal information to advertise our products to you or otherwise.

Subject to certain limitations, you have the right to (1) request to know more about the categories and specific pieces of personal information we collect, use, and disclose, and sell, (2) request deletion of your personal information, (3) opt out of any "sales" of your personal information that may be occurring, and (4) not be discriminated against for exercising these rights. You may make these requests by emailing us at vanadatadex@gmail.com. If we receive your request from an authorized agent, we may ask for evidence that you have provided such agent with a power of attorney or that the agent otherwise has valid written authority to submit requests to exercise rights on your behalf. If you are an authorized agent seeking to make a request, please contact us.

### **Shine the Light**

DataDex does not share such information with third parties for direct marketing purposes.

### **Do Not Track Signals**

Our Services do not respond to "Do Not Track" signals communicated by your browser. We do not knowingly retain or sell tracking information collected about your online activity. For more information about Do Not Track, please visit [www.allaboutdnt.com](https://allaboutdnt.com/).

## **Additional Disclousures for Individuals in Europe**

If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, you have certain rights and protections under the law regarding the processing of your personal data, and this section applies to you.

### **Legal Basis for Processing**

DataDex does not typically process user personal data. If DataDex processes data, such as a wallet address and certain IP addresses, it will do so in reliance on the following lawful bases:

- To perform our responsibilities under our contract with you (e.g., providing access to the UI you requested).
- When we have a legitimate interest in processing your personal data to operate the UI or protect our interests (e.g., to adhere with applicable laws, rules and regulations, provide, maintain, and improve our products and UI, conduct data analytics, and communicate with you).
- To comply with our legal obligations.

### **Data Retention**

We do not maintain customer accounts or store personal data. Our vendor will store your wallet address in order to provide requested services.

### **Data Subject Requests**

Subject to certain limitations, you have the right to request access to the personal data we hold about you and to receive your data in a portable format, the right to ask that your personal data be corrected or erased, and the right to object to, or request that we restrict, certain processing. DataDex does not typically hold or store such personal data.

## **Contact Us**

If you have any questions about this Privacy Policy, please contact us at vanadatadex@gmail.com.`.replace(
              /[\n\r]/g,
              '\n'
            )}
          />
        </MarkDownWrapper>
      </AutoColumn>
      <SmallButtonPrimary as={Link} to={toWithPreservedRouterSearch('/', search)}>
        <Trans>Back to swapping!</Trans>
      </SmallButtonPrimary>
    </PageWrapper>
  )
}
