import React from 'react'
import PortalCard from '../ui/PortalCard'
import { useBloodData } from '../../hooks/useBloodData'
import './PortalsSection.css'

const PortalsSection = () => {
  const { donorStats, inventoryStats } = useBloodData()

  const portals = [
    {
      title: 'Donor Portal',
      description: 'Register, book appointment, and manage your donation history',
      stat: {
        value: donorStats.registered,
        label: 'Donor Registered'
      }
    },
    {
      title: 'Inventory Portal',
      description: 'View real-time blood stock information.\nKnow Shortages',
      stat: {
        value: inventoryStats.collected,
        label: 'Blood Units Collected'
      }
    }
  ]

  return (
    <div className="portals-section">
      {portals.map((portal, index) => (
        <PortalCard
          key={index}
          title={portal.title}
          description={portal.description}
          stat={portal.stat}
        />
      ))}
    </div>
  )
}

export default PortalsSection