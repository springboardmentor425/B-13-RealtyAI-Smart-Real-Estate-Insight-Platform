import { useState } from 'react'
import { useHealth } from './hooks/useHealth'
import Header from './components/layout/Header'
import TabBar from './components/layout/TabBar'
import Footer from './components/layout/Footer'
import StructuredTab from './components/structured/StructuredTab'
import SatelliteTab from './components/satellite/SatelliteTab'
import { TABS } from './utils/constants'

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.STRUCTURED)
  const { structuredHealth, satelliteHealth } = useHealth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header structuredHealth={structuredHealth} satelliteHealth={satelliteHealth} />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {activeTab === TABS.STRUCTURED && <StructuredTab />}
        {activeTab === TABS.SATELLITE  && <SatelliteTab />}
      </main>

      <Footer />
    </div>
  )
}
