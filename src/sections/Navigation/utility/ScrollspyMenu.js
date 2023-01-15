import React from "react";
import { Link as OnepageLink } from "react-scroll";
import Link from "next/link";

const ScrollspyMenu = ({ menuItems, ...props }) => {
  const addAllClasses = [""];
  if (props.className) {
    addAllClasses.push(props.className);
  }

  const SubItemsList = ({ subItems }) => (
    <ul className="dropdown">
      {subItems.map((subItem, i) => (
        <li key={i}>
          <Link href={subItem.path}>
            <a>{subItem.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <ul className={addAllClasses.join(" ")}>
      {menuItems.map((menu, index) => {
        return (
          <li
            key={index}
            className={
              menu.subItems !== undefined ? "nav-item has-dropdown" : "nav-item"
            }
          >
            {menu.path.includes("/") ? (
              <Link href={menu.path}>
                <a>{menu.name}</a>
              </Link>
            ) : (
              <OnepageLink
                activeClass="nav-active"
                to={menu.path}
                spy={true}
                smooth={true}
                offset={parseInt(menu.offset)}
                duration={700}
              >
                {menu.name}
              </OnepageLink>
            )}

            {!!menu.subItems && menu.subItems.length && (
              <SubItemsList
                key={"subItems-" + index}
                subItems={menu.subItems}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ScrollspyMenu;
