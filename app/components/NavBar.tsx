import { FaGithub } from "react-icons/fa";
import { MdLightMode } from "react-icons/md";
import Image from "next/image";
import { MdLeaderboard } from "react-icons/md";
import { SiGitbook } from "react-icons/si";
import { GiMiningHelmet } from "react-icons/gi";

import { useContext } from "react";
import { ThemeContext } from "@/app/context/ThemeContext";
import tailwindConfig from "@/tailwind.config";
import Link from "next/link";

export const NavBar = () => {
  const { changeTheme } = useContext(ThemeContext);
  const { theme } = useContext(ThemeContext);

  const DARK_THEMES = {
    dark: true,
    synthwave: true,
    forest: true,
    aqua: true,
    black: true,
    luxury: true,
    dracula: true,
    business: true,
    night: true,
    coffee: true,
    dim: true,
    sunset: true,
    halloween: true,
  };

  const logo = () => {
    // @ts-ignore
    if (DARK_THEMES[theme]) {
      return "/solxen-white.png";
    }
    return "/solxen-black.png";
  };

  function navItems() {
    return (
      <>
        <li>
          <Link href="/leaderboard">
            <MdLeaderboard /> Leaderboard
          </Link>
        </li>
        <li>
          <Link href="https://docs.solxen.io/">
            <SiGitbook />
            Gitbook
          </Link>
        </li>
        <li>
          <Link href="https://preview.xen.network/sol/solXEN">
            <GiMiningHelmet />
            Web Miner
          </Link>
        </li>
        <li>
          <details>
            <summary>
              <MdLightMode /> Theme
            </summary>
            <ul className="p-2">
              {tailwindConfig.daisyui.themes.map((theme: string) => (
                <li key={theme}>
                  <a onClick={() => (changeTheme ? changeTheme(theme) : null)}>
                    {theme}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </li>
      </>
    );
  }

  return (
    <div className="navbar p-0 bg-base-100 shadow-xl opacity-85 flex justify-between z-[20]">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {navItems()}
          </ul>
        </div>

        <a className="btn btn-link animate-none text-lg" href="/">
          <Image src={logo()} alt="solXEN Logo" width={100} height={40} />
        </a>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navItems()}</ul>
      </div>

      <div className="navbar-end">
        <Link className=" ml-auto" href="https://github.com/FairCrypto/sol-xen">
          <button className="btn btn-outline btn-accent">
            <FaGithub size="2em"></FaGithub>
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};
