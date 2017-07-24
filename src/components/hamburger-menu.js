import React from 'react';

import LinkMenu from './link-menu';

class HamburgerMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const {open} = this.state;
    return (
      <div className={`hamburger-menu ${open ? 'open' : ''}`}>
        <div
          onClick={() => this.setState({open: !open})}
          className="hamburger-title">
          <div className="hamburger-name">ANDREW MCNUTT</div>
          <div className="hamburger-spinner">
            <svg width="25px" height="21px" >
              <rect x="0" y="0" width="25" height="3" />
              <rect x="0" y="7" width="25" height="3" />
              <rect x="0" y="14" width="25" height="3" />
            </svg>
          </div>
        </div>
        <div className="hamburger-links">
          <LinkMenu onClick={() => this.setState({open: !open})} />
        </div>
        {open && <div
          className="hamburger-coverall"
          onClick={() => this.setState({open: !open})}/>}
      </div>
    );
  }
}
HamburgerMenu.displayName = 'App';
export default HamburgerMenu;
