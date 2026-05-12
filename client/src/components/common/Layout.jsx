import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import ErrorBoundary from './ErrorBoundary'

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', 
      backgroundColor: '#08080F' }}>
      
      <Sidebar />
      
      <div style={{ 
        marginLeft: '260px', 
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        
        <main style={{ 
          marginTop: '64px', 
          padding: '24px',
          flex: 1,
          minHeight: 'calc(100vh - 64px)'
        }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default Layout
