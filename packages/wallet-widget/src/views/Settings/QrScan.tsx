// import { Button, Card, TabsContent, TabsHeader, TabsRoot, Text, TextInput, useMediaQuery } from '@0xsequence/design-system'
// import { Scanner } from '@yudiel/react-qr-scanner'
// import { ChangeEvent, useState } from 'react'

// import { HEADER_HEIGHT } from '../../constants'
// // import { useWalletConnectContext } from '../../contexts/WalletConnect'
// import { useNavigation } from '../../hooks'

// export function QrScan() {
//   const isMobile = useMediaQuery('isMobile')
//   const { goBack } = useNavigation()
//   const [signClientUri, setSignClientUri] = useState<string>('')
//   const [selectedTab, setSelectedTab] = useState<'scan' | 'paste'>('scan')
//   // const { pair } = useWalletConnectContext()

//   const handleSignClientUri = async () => {
//     if (signClientUri) {
//       console.log(signClientUri)
//       try {
//         // await pair(signClientUri)
//       } catch (error) {
//         console.error('Error pairing with dapp', error)
//         return
//       }
//     }
//   }

//   return (
//     <div className="flex flex-col px-4 pb-4 gap-4" style={{ paddingTop: HEADER_HEIGHT }}>
//       <Text variant="large" fontWeight="bold" color="text80">
//         Connect to a DApp using WalletConnect
//       </Text>
//       <TabsRoot
//         className="flex flex-col justify-center items-center gap-4"
//         value={selectedTab}
//         onValueChange={value => setSelectedTab(value as 'scan' | 'paste')}
//       >
//         <TabsHeader
//           tabs={[
//             { label: 'Scan QR', value: 'scan' },
//             { label: 'Paste URI', value: 'paste' }
//           ]}
//           value={selectedTab}
//         />
//         <TabsContent value={'scan'}>
//           <Card style={{ height: '428px', width: '428px' }}>
//             <Scanner
//               onScan={result => {
//                 if (result[0].rawValue) {
//                   setSignClientUri(result[0].rawValue)
//                 }
//               }}
//               styles={{
//                 video: {
//                   transform: isMobile ? 'scaleX(-1)' : 'scaleX(1)',
//                   borderRadius: '10px'
//                 }
//               }}
//             />
//           </Card>
//         </TabsContent>
//         <TabsContent className="flex flex-col w-full gap-4" value={'paste'}>
//           <TextInput
//             name="signClientUri"
//             value={signClientUri}
//             onChange={(ev: ChangeEvent<HTMLInputElement>) => setSignClientUri(ev.target.value)}
//           />
//           <div className="flex justify-end p-6 gap-2">
//             <Button
//               size="md"
//               shape="square"
//               label="Cancel"
//               onClick={() => {
//                 goBack()
//               }}
//             />
//             <Button
//               variant="primary"
//               size="md"
//               shape="square"
//               label="Connect Dapp"
//               disabled={!signClientUri}
//               onClick={() => {
//                 if (signClientUri) {
//                   handleSignClientUri()
//                 }
//               }}
//             />
//           </div>
//         </TabsContent>
//       </TabsRoot>
//     </div>
//   )
// }
