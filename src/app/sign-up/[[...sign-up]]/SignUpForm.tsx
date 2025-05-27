"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Icons } from "../../components/ui/icons";
import { cn } from "@/app/library/utils";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { ClerkProvider } from "@clerk/nextjs";


interface SignUpFormProps {
    setIsOpenModal: (value: boolean) => void;
  }

  
export default function SignUpForm({ setIsOpenModal }: SignUpFormProps) {
  
  
  return (
    
          <SignUp.Root>
            <Clerk.Loading>
              {(isGlobalLoading) => (
                <>
                  {/* Başlangıç Adımı */}
                  <SignUp.Step name="start">
                    <div className="w-full max-w-sm space-y-6">
                      <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">
                          E-posta adresiyle kaydolun
                        </h1>
                      </div>

                      <div className="space-y-6 justify-center">
                        {/* E-posta ve Şifre */}
                        <div className="space-y-4">
                          <Clerk.Field name="username" className="space-y-1">
                            
                            <Clerk.Input type="text" required asChild>
                              <Input className="w-full " placeholder="Kullanıcı adı"/>
                            </Clerk.Input>
                            <Clerk.FieldError className="text-sm text-red-600" />
                          </Clerk.Field>

                          <Clerk.Field
                            name="emailAddress"
                            className="space-y-1"
                          >
                           
                            <Clerk.Input type="email" required asChild>
                              <Input className="w-full" placeholder="E-posta adresi" />
                            </Clerk.Input>
                            <Clerk.FieldError className="text-sm text-red-600" />
                          </Clerk.Field>

                          <Clerk.Field name="password" className="space-y-1">
                            
                            <Clerk.Input type="password" required asChild>
                              <Input className="w-full" placeholder="Şifre" />
                            </Clerk.Input>
                            <Clerk.FieldError className="text-sm text-red-600" />
                          </Clerk.Field>
                        </div>

                        {/* Devam Et Butonu */}
                        <SignUp.Action submit asChild>
                          <Button
                            disabled={isGlobalLoading}
                            className="w-full bg-orange-500 hover:bg-orange-700 text-white cursor-pointer"
                          >
                            <Clerk.Loading>
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  "Devam et"
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </SignUp.Action>

                        <div className="flex items-center gap-x-3 text-sm text-gray-500">
                          <span className="h-px flex-1 bg-gray-300"></span>
                          veya
                          <span className="h-px flex-1 bg-gray-300"></span>
                        </div>

                        <div className="flex justify-center gap-3">
                          <Clerk.Connection name="google" asChild>
                            <Button
                              variant="outline"
                              disabled={isGlobalLoading}
                              size="default"
                              className="cursor-pointer"
                            >
                              <Clerk.Loading scope="provider:google">
                                {(isLoading) =>
                                  isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    <>
                                      <FcGoogle className="size-8" />
                                    </>
                                  )
                                }
                              </Clerk.Loading>
                            </Button>
                          </Clerk.Connection>
                          <Clerk.Connection name="facebook" asChild>
                            <Button
                              variant="outline"
                              size={"default"}
                              disabled={isGlobalLoading}
                              className="cursor-pointer"
                            >
                              <Clerk.Loading scope="provider:facebook">
                                {(isLoading) =>
                                  isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    <FaFacebook className="size-8 text-blue-600" />
                                  )
                                }
                              </Clerk.Loading>
                            </Button>
                          </Clerk.Connection>

                          <Clerk.Connection name="apple" asChild>
                            <Button
                              variant="outline"
                              size={"default"}
                              disabled={isGlobalLoading}
                              className="cursor-pointer"
                            >
                              <Clerk.Loading scope="provider:apple">
                                {(isLoading) =>
                                  isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    <FaApple className="size-8 " />
                                  )
                                }
                              </Clerk.Loading>
                            </Button>
                          </Clerk.Connection>
                        </div>

                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpenModal(true);
                          }}
                          className="w-full flex justify-center"
                        >
                          <p className="cursor-pointer">
                            Zaten hesabınız var mı? Oturum açın
                          </p>
                        </Button>
                      </div>
                    </div>
                  </SignUp.Step>

                  

                  {/* Doğrulama Adımı */}
                  <SignUp.Step name="verifications">
                    <SignUp.Strategy name="email_code">
                      <div className="w-full max-w-md space-y-6">
                        <div className="text-center">
                          <h1 className="text-2xl font-semibold text-gray-900">
                            E-postanızı doğrulayın
                          </h1>
                          <p className="text-sm text-gray-600">
                            E-posta adresinize gönderilen kodu girin.
                          </p>
                        </div>
                        <Clerk.Field name="code" className="space-y-2">
                          <Clerk.Label className="sr-only">
                            Doğrulama Kodu
                          </Clerk.Label>
                          <div className="flex justify-center">
                            <Clerk.Input
                              type="otp"
                              className="flex justify-center has-[:disabled]:opacity-50"
                              autoSubmit
                              render={({ value, status }) => (
                                <div
                                  data-status={status}
                                  className={cn(
                                    "flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
                                    {
                                      "z-10 ring-2 ring-orange-500 ring-offset-background":
                                        status === "cursor" ||
                                        status === "selected",
                                    }
                                  )}
                                >
                                  {value}
                                  {status === "cursor" && (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                      <div className="animate-caret-blink h-4 w-px bg-gray-900 duration-1000" />
                                    </div>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <Clerk.FieldError className="text-center text-sm text-red-600" />
                        </Clerk.Field>
                        <SignUp.Action
                          asChild
                          resend
                          className="text-gray-600"
                          fallback={({ resendableAfter }) => (
                            <Button
                              variant="link"
                              size="sm"
                              disabled
                              className="w-full"
                            >
                              Kod almadınız mı? Yeniden gönderin (
                              {resendableAfter})
                            </Button>
                          )}
                        >
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="w-full"
                          >
                            Kod almadınız mı? Yeniden gönderin
                          </Button>
                        </SignUp.Action>
                        <SignUp.Action submit asChild>
                          <Button
                            disabled={isGlobalLoading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Clerk.Loading>
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  "Devam et"
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </SignUp.Action>
                      </div>
                    </SignUp.Strategy>
                  </SignUp.Step>
                </>
              )}
            </Clerk.Loading>
          </SignUp.Root>
          
  );
}
