import React from "react";
import type { Route } from "./+types/home";
import { useLoaderData, Link } from "react-router";
import {
  getSweets,
  searchSweets,
  getToken,
  getUsernameFromToken,
  clearToken,
  getTokenFromCookieHeader,
  clearAuthCookie,
  isAdmin as checkAdmin,
  purchaseSweet,
} from "~/lib/api";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ShoppingCart, LogOut, Shield, User as UserIcon, PackageX } from "lucide-react";
import CartSheet from "~/components/cart";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sweets" },
    { name: "description", content: "Browse and buy sweets" },
  ];
}

type Sweet = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export default function Home() {
  const data = useLoaderData<typeof loader>() as {
    sweets: Sweet[];
    username: string | null;
    isAdmin: boolean;
    filters?: { name?: string; category?: string; min_price?: string; max_price?: string };
    isAuthenticated: boolean;
  };

  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);

  const currency = (n: number) => `$${n.toFixed(2)}`;

  const handleAddToCart = (s: Sweet) => {
    const id = String(s.id);
    setCart((curr) => {
      const qtyInCart = curr[id] ?? 0;
      const next = Math.min(qtyInCart + 1, s.quantity);
      if (next === qtyInCart) return curr;
      return { ...curr, [id]: next };
    });
  };

  const handleIncrement = (id: string) => {
    const sweet = data.sweets.find((sw) => String(sw.id) === id);
    if (!sweet) return;
    setCart((curr) => {
      const nextQty = Math.min((curr[id] ?? 0) + 1, sweet.quantity);
      return { ...curr, [id]: nextQty };
    });
  };

  const handleDecrement = (id: string) => {
    setCart((curr) => {
      const nextQty = (curr[id] ?? 0) - 1;
      const copy = { ...curr };
      if (nextQty <= 0) {
        delete copy[id];
      } else {
        copy[id] = nextQty;
      }
      return copy;
    });
  };

  const handleRemove = (id: string) => {
    setCart((curr) => {
      const copy = { ...curr };
      delete copy[id];
      return copy;
    });
  };

  const cartItems = React.useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const sweet = data.sweets.find((s) => String(s.id) === id)!;
      return {
        id,
        name: sweet.name,
        price: sweet.price,
        quantity: qty,
        available: sweet.quantity,
      };
    });
  }, [cart, data.sweets]);

  const totalCount = React.useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart]
  );

  const handlePurchase = async () => {
    if (cartItems.length === 0) return;
    setIsPurchasing(true);
    try {
      // Acquire token: localStorage first, then cookie (for SSR/redirect flows)
      let token = getToken();
      if (!token) {
        token = getTokenFromCookieHeader(typeof document !== "undefined" ? document.cookie : null);
      }
      if (!token) {
        location.href = "/login";
        return;
      }
      // Execute purchases sequentially to get server validation/error per item
      for (const it of cartItems) {
        await purchaseSweet(token, it.id, it.quantity);
      }
      // Clear cart and close sheet
      setCart({});
      setCartOpen(false);
      // Reload to refresh stocks via loader
      location.reload();
    } catch (e: any) {
      const status = e?.status;
      const message = e?.message || "Purchase failed";
      if (status === 401) {
        location.href = "/login";
        return;
      }
      alert(message);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Top bar */}
      <Card className="sticky top-0 z-10 border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              {data.isAuthenticated ? (
                <div>
                  Logged in as{" "}
                  <strong className="font-semibold">{data.username ?? "User"}</strong>
                </div>
              ) : (
                <div>Browsing as <strong className="font-semibold">Guest</strong></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {data.isAdmin && (
                <Button asChild variant="secondary" size="sm">
                  <Link to="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              {data.isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearToken();
                    clearAuthCookie();
                    location.href = "/login";
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={() => setCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart
                <Badge
                  variant="secondary"
                  className="ml-2"
                >
                  {totalCount}
                </Badge>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <section>
        <form method="get" className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            type="text"
            name="name"
            placeholder="Search name..."
            defaultValue={data.filters?.name ?? ""}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            type="text"
            name="category"
            placeholder="Category"
            defaultValue={data.filters?.category ?? ""}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            type="number"
            name="min_price"
            step="0.01"
            min="0"
            placeholder="Min price"
            defaultValue={data.filters?.min_price ?? ""}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            type="number"
            name="max_price"
            step="0.01"
            min="0"
            placeholder="Max price"
            defaultValue={data.filters?.max_price ?? ""}
          />
          <div className="md:col-span-5 flex gap-2 pt-1">
            <Button type="submit" size="sm">Search</Button>
            {(data.filters?.name || data.filters?.category || data.filters?.min_price || data.filters?.max_price) && (
              <Button type="button" variant="outline" size="sm" onClick={() => (location.href = "/")}>Clear</Button>
            )}
          </div>
        </form>
      </section>

      {/* Sweets grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Sweets</h2>
        </div>
        {data.sweets.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <PackageX className="h-4 w-4" />
              No sweets available.
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.sweets.map((s: Sweet) => {
              const id = String(s.id);
              const inCart = cart[id] ?? 0;
              const outOfStock = s.quantity === 0;
              const maxed = inCart >= s.quantity && s.quantity > 0;
              const lowStock = s.quantity > 0 && s.quantity <= 5;

              return (
                <li key={id}>
                  <Card className="h-full transition-shadow hover:shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium leading-tight">{s.name}</div>
                        <Badge variant="secondary">{s.category}</Badge>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Price</div>
                        <div className="font-medium">{currency(s.price)}</div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Stock</div>
                        <div className="flex items-center gap-2">
                          {outOfStock ? (
                            <Badge variant="destructive">Out of stock</Badge>
                          ) : (
                            <>
                              <span className="font-medium">{s.quantity}</span>
                              {lowStock && (
                                <Badge variant="outline" className="text-amber-600 border-amber-200">
                                  Low
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(s)}
                          disabled={outOfStock || maxed}
                          className="w-full"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {outOfStock ? "Unavailable" : maxed ? "Max added" : "Add to cart"}
                        </Button>
                        {inCart > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground text-right">
                            In cart: <span className="font-medium">{inCart}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onPurchase={handlePurchase}
        isPurchasing={isPurchasing}
      />
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("cookie");
  const tokenFromCookie = getTokenFromCookieHeader(cookieHeader);
  const token = tokenFromCookie ?? getToken();
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const min_price = url.searchParams.get("min_price") || undefined;
    const max_price = url.searchParams.get("max_price") || undefined;
    const hasFilters = name || category || min_price || max_price;
    const sweets = hasFilters
      ? await searchSweets(token || undefined, {
          name,
          category,
          min_price: min_price ? Number(min_price) : undefined,
          max_price: max_price ? Number(max_price) : undefined,
        })
      : await getSweets(token || undefined);
    const username = getUsernameFromToken(token);
    const isAdmin = token ? await checkAdmin(token) : false;
    return {
      sweets,
      username,
      isAdmin,
      filters: { name, category, min_price, max_price },
      isAuthenticated: !!token,
    };
  } catch (e) {
    // On API errors, show empty list but keep page public
    return {
      sweets: [],
      username: null,
      isAdmin: false,
      filters: { name: undefined, category: undefined, min_price: undefined, max_price: undefined },
      isAuthenticated: false,
    };
  }
}