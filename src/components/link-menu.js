import React from 'react';

import {Link} from 'react-router-dom';

const links = [
  {name: 'ABOUT', href: '#/about'},
  {name: 'PROJECTS', href: '#/projects'},
  {name: 'RESEARCH', href: '#/research'}
];
const REGULAR_LINK_CLASS = 'internal-link';
const SELECTED_LINK_CLASS = `${REGULAR_LINK_CLASS} selected-link`;

class LinkMenu extends React.Component {
  render() {
    const locationSplit = location.href.split('/');
    const locName = locationSplit[locationSplit.length - 1].toUpperCase();
    const selectedLink = links.findIndex(link => link.name === locName);
    const linkIndex = selectedLink < 0 ? 0 : selectedLink;

    const {onClick} = this.props;
    return (
      <div className="link-menu">
        {links.map((link, index) => (
          <Link
            className="internal-link"
            className={
              index === linkIndex ? SELECTED_LINK_CLASS : REGULAR_LINK_CLASS
            }
            onClick={onClick}
            to={link.href}
            key={link.name}>
            {link.name}
          </Link>
        ))}
      </div>
    );
  }
}
LinkMenu.defaultProps = {
  onClick: () => {}
};
LinkMenu.displayName = 'App';
export default LinkMenu;
