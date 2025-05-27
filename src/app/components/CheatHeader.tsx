"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { FiSettings, FiHome, FiRefreshCw, FiSend } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { GoSidebarCollapse } from "react-icons/go";
import { useSidebar } from "../chat/SidebarContext";

interface ChatHeaderProps {
  topic?: string;
  onRestartChat?: () => void;
  onSendAssignment?: () => void;
}

export default function ChatHeader({
  topic,
  onRestartChat,
  onSendAssignment,
}: ChatHeaderProps) {
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isOpen } = useSidebar();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prop'ların gelip gelmediğini ve türlerini kontrol edelim

  const handleActionClick = (action?: () => void) => {
    if (action) {
      action();
    }
  };

  const { toggle } = useSidebar();

  return (
    <header
      className={`sticky top-0 z-20 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? "backdrop-blur-md bg-white/80"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            {/* onToggleSidebar prop'u varsa butonu render et */}

            <button
              onClick={toggle} // Yeni handler fonksiyonunu kullan
              className={` text-gray-700 hover:text-black focus:outline-none
                  ${isOpen ? "hidden" : "block"}`}
              aria-label="Kenar çubuğunu aç/kapat"
              // style={{ border: '1px solid red', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} // Debug için gerekirse açabilirsiniz
            >
              <GoSidebarCollapse size={30} /* style={{ fill: 'blue' }} */ />
            </button>

            {/* ... (topic vs. aynı kalacak) ... */}
            <span
              className={`
    mx-3
    text-gray-400
    transition-all
    duration-200
    ${isOpen ? "hidden" : "inline-block sm:inline"}
  `}
            >
              |
            </span>
            {topic && (
              <>
                <span
                  className={
                    "text-sm truncate max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg flex items-center text-gray-700"
                  }
                >
                  <Link href="/" className="items-center md:block hidden">
                    <Image
                      src="/logo.svg"
                      alt="Platform Logo"
                      width={36}
                      height={36}
                    />
                  </Link>
                </span>
              </>
            )}
            {!topic && typeof onToggleSidebar !== "function" && (
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Platform Logo"
                  width={36}
                  height={36}
                />
              </Link>
            )}
          </div>

          {/* Sağ Taraf: Ayarlar Dropdown */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* ... (Sağ taraf menü kodu aynı kalacak) ... */}
            <SignedIn>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="inline-flex justify-center items-center w-full rounded-full p-2 hover:bg-gray-100/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-gray-600 hover:text-gray-800 data-active:text-gray-800">
                    <FiSettings size={22} aria-hidden="true" />
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  anchor="bottom end"
                  className="absolute right-0 mt-2 w-60 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
                             transition ease-out duration-100 data-[closed]:opacity-0 data-[closed]:scale-95 [--anchor-gap:var(--spacing-2)] z-30"
                >
                  <MenuItem>
                    <a
                      href="/"
                      className="text-gray-900 data-focus:bg-orange-500 data-focus:text-white group flex w-full items-center rounded-md px-3 py-2 text-sm text-left"
                    >
                      <FiHome
                        className="mr-2 ml-1 mt-0.5 h-5 w-5 group-data-focus:text-white"
                        aria-hidden="true"
                      />
                      Ana Menü
                    </a>
                  </MenuItem>
                  {(onRestartChat || onSendAssignment) && (
                    <div className="px-1 py-1" role="none">
                      {onRestartChat && (
                        <MenuItem>
                          <button
                            onClick={() => handleActionClick(onRestartChat)}
                            className="text-gray-900 data-focus:bg-orange-500 data-focus:text-white group flex w-full items-center rounded-md px-3 py-2 text-sm text-left"
                          >
                            <FiRefreshCw
                              className="mr-2 h-5 w-5 group-data-focus:text-white"
                              aria-hidden="true"
                            />
                            Sohbeti Yeniden Başlat
                          </button>
                        </MenuItem>
                      )}
                      {onSendAssignment && (
                        <MenuItem>
                          <button
                            onClick={() => handleActionClick(onSendAssignment)}
                            className="text-gray-900 data-focus:bg-orange-500 data-focus:text-white group flex w-full items-center rounded-md px-3 py-2 text-sm text-left"
                          >
                            <FiSend
                              className="mr-2 h-5 w-5 group-data-focus:text-white"
                              aria-hidden="true"
                            />
                            Ödevi Gönder
                          </button>
                        </MenuItem>
                      )}
                    </div>
                  )}
                  {user && (
                    <div className="px-1 py-1" role="none">
                      <UserButton
                        appearance={{
                          elements: {
                            userButtonBox: "w-full",
                            userButtonTrigger:
                              "w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none",
                            userButtonAvatarBox: "w-6 h-6 mr-2",
                          },
                        }}
                        afterSignOutUrl="/"
                      />
                    </div>
                  )}
                </MenuItems>
              </Menu>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm text-gray-600 hover:text-orange-500"
              >
                Giriş Yap
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
