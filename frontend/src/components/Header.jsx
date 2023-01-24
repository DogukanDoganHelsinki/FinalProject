import './Header.scss'

function Header({ logout, username }) {

  const onLogout = () => {
    logout()
  }

  return (
    <div className='header'>
      <nav className='topnav'>
        {/* <a className='navitem navbutton'>{username}</a> */}
        <a className='navitem logo'>:P</a>
        <h2 className='navitem topnav-header'>Restaurant picker</h2>
        <a className='navitem navbutton logoutBtn' onClick={onLogout}><span>logout</span></a>
      </nav>
    </div>
  )
}

export default Header
