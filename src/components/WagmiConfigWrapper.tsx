import { WagmiConfig, configureChains, createConfig, mainnet, sepolia } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { /*chains, */publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [publicProvider()],
)
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
})

interface WagmiConfigWrapperProps {
  children: React.ReactNode
}

const WagmiConfigWrapper = ({children}: WagmiConfigWrapperProps) => {
  return (<WagmiConfig config={config}>
    {children}
  </WagmiConfig>)
}

export default WagmiConfigWrapper;