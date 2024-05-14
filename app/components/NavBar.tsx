import { FaGithub } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";
import Image from 'next/image'

import React, {useContext} from "react";
import { ThemeContext } from "@/app/context/ThemeContext";
import tailwindConfig from "@/tailwind.config";
import Link from "next/link";

export const NavBar = () => {
  const { changeTheme } = React.useContext(ThemeContext);
  const { theme } = useContext(ThemeContext);

  const DARK_THEMES = {
    'dark': true,
    'synthwave': true,
    'forest': true,
    'aqua': true,
    'black': true,
    'luxury': true,
    'dracula': true,
    'business': true,
    'night': true,
    'coffee': true,
    'dim': true,
    'sunset': true,
    'halloween': true
  }

  const logo = () => {
    // @ts-ignore
    if (DARK_THEMES[theme]) {
      return "/solxen-white.png";
    }
    return "/solxen-black.png";
  }

  return (
    <div className="navbar p-0 bg-base-100 shadow-xl opacity-85 flex justify-between z-[2]">
      <a className="btn btn-link animate-none text-lg" href="/">
        <Image src={logo()} alt="solXEN Logo" width={100} height={40} />
      </a>

      <Link className=" ml-auto" href="https://github.com/FairCrypto/sol-xen">
        <button className="btn btn-outline btn-accent">
          <FaGithub size="2em"></FaGithub>
          Get Started
        </button>
      </Link>

      <div className="join join-vertical">
        <div className="dropdown dropdown-hover dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost m-1">
            <MdLightMode size="2em" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {tailwindConfig.daisyui.themes.map((theme: string) => (
              <li key={theme}>
                <a onClick={() => (changeTheme ? changeTheme(theme) : null)}>
                  {theme}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
