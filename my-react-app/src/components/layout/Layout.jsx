import React from 'react'
import Navigation from './Navigation'
import './Layout.css'

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <main className="layout-main">
        {children}
      </main>
      
      {/* Decorative Elements */}
      <div className="decorative-line-vertical"></div>
      <div className="decorative-line-horizontal"></div>
    </div>
  )
}

export default Layout