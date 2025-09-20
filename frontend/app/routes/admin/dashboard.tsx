import React from "react";
import {
  redirect,
  useLoaderData,
  Link,
  Form,
  useNavigation,
} from "react-router";
import {
  isAdmin as checkAdmin,
  getToken,
  clearToken,
  getTokenFromCookieHeader,
  clearAuthCookie,
  getSweets,
  createSweet,
  updateSweet,
  deleteSweet,
  restockSweet,
  getUsernameFromToken,
} from "~/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";

import {
  Home,
  LogOut,
  PlusCircle,
  Pencil,
  RefreshCcw,
  Trash2,
  Package,
  Loader2,
  Search,
  Boxes,
  PackageX,
  AlertTriangle,
} from "lucide-react";

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("cookie");
  const tokenFromCookie = getTokenFromCookieHeader(cookieHeader);
  const token = tokenFromCookie ?? getToken();
  if (!token) throw redirect("/login");
  const admin = await checkAdmin(token);
  if (!admin) throw redirect("/");
  const sweets = await getSweets(token);
  const username = getUsernameFromToken(token) || "Admin";
  return { role: "admin" as const, sweets, username };
}

export function meta() {
  return [
    { title: "Admin Dashboard" },
    { name: "description", content: "Admin-only dashboard" },
  ];
}

type Sweet = {
  id: number | string;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const intent = String(form.get("intent") || "");
  const tokenHeader = request.headers.get("cookie");
  const tokenFromCookie = getTokenFromCookieHeader(tokenHeader);
  const token = tokenFromCookie;
  if (!token) return redirect("/login");
  try {
    if (intent === "create") {
      await createSweet(token, {
        name: String(form.get("name")),
        category: String(form.get("category")),
        price: Number(form.get("price")),
        quantity: Number(form.get("quantity")),
      });
    } else if (intent === "update") {
      const id = String(form.get("id"));
      await updateSweet(token, id, {
        name: String(form.get("name")),
        category: String(form.get("category")),
        price: Number(form.get("price")),
        quantity: Number(form.get("quantity")),
      });
    } else if (intent === "delete") {
      const id = String(form.get("id"));
      await deleteSweet(token, id);
    } else if (intent === "restock") {
      const id = String(form.get("id"));
      const qty = Number(form.get("quantity"));
      await restockSweet(token, id, qty);
    }
    return redirect("/admin");
  } catch (e: any) {
    const msg = e?.message || "Action failed";
    return redirect(`/admin?error=${encodeURIComponent(msg)}`);
  }
}

export default function AdminDashboard() {
  const data = useLoaderData<typeof loader>() as {
    sweets: Sweet[];
    username: string;
  };
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [createOpen, setCreateOpen] = React.useState(false);

  const currency = (n: number) => `$${n.toFixed(2)}`;

  // Stats
  const totalSkus = data.sweets.length;
  const totalUnits = React.useMemo(
    () => data.sweets.reduce((sum, s) => sum + (s.quantity || 0), 0),
    [data.sweets]
  );
  const lowCount = React.useMemo(
    () => data.sweets.filter((s) => s.quantity > 0 && s.quantity <= 5).length,
    [data.sweets]
  );
  const outCount = React.useMemo(
    () => data.sweets.filter((s) => s.quantity === 0).length,
    [data.sweets]
  );

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    data.sweets.forEach((s) => set.add(s.category));
    return Array.from(set).sort();
  }, [data.sweets]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.sweets.filter((s) => {
      const matchesCategory = category === "all" || s.category === category;
      const matchesQuery =
        q.length === 0 ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        String(s.id).toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [data.sweets, query, category]);

  return (
    <TooltipProvider delayDuration={200}>
      <main className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hello {data.username}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage sweets, prices, and stock.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearToken();
                clearAuthCookie();
                location.href = "/login";
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalSkus}</div>
              <Boxes className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Units in stock
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold tabular-nums">
                {totalUnits}
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low stock
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{lowCount}</div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of stock
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{outCount}</div>
              <PackageX className="h-5 w-5 text-destructive" />
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative w-full md:max-w-sm">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, category, or ID"
                    className="pl-8"
                    type="search"
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger aria-label="Filter by category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Create Sweet dialog trigger */}
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Sweet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Sweet</DialogTitle>
                    <DialogDescription>
                      Add a new sweet to your catalog.
                    </DialogDescription>
                  </DialogHeader>
                  <Form method="post" className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g. Chocolate Bar"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        placeholder="e.g. Candy"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 2.50"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        placeholder="e.g. 25"
                        required
                      />
                    </div>
                    <input type="hidden" name="intent" value="create" />
                    <DialogFooter className="gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={busy}>
                        {busy ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Create"
                        )}
                      </Button>
                    </DialogFooter>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sweets</CardTitle>
            <CardDescription>
              Quickly edit details, restock, or remove items.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <Package className="h-5 w-5" />
                No sweets match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Name</TableHead>
                      <TableHead className="min-w-[140px]">Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="w-[180px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => {
                      const idStr = String(s.id);
                      const lowStock = s.quantity > 0 && s.quantity <= 5;
                      const outOfStock = s.quantity === 0;

                      return (
                        <TableRow key={idStr}>
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {s.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {currency(s.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {outOfStock ? (
                              <Badge variant="destructive">Out</Badge>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <span className="tabular-nums">
                                  {s.quantity}
                                </span>
                                {lowStock && (
                                  <Badge
                                    variant="outline"
                                    className="border-amber-200 text-amber-600"
                                  >
                                    Low
                                  </Badge>
                                )}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1.5">
                              {/* Edit */}
                              <Dialog>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Edit"
                                      >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                    </DialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Sweet</DialogTitle>
                                    <DialogDescription>
                                      Update this sweet’s details and save.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Form method="post" className="grid gap-4">
                                    <input
                                      type="hidden"
                                      name="id"
                                      value={idStr}
                                    />
                                    <input
                                      type="hidden"
                                      name="intent"
                                      value="update"
                                    />
                                    <div className="grid gap-2">
                                      <Label htmlFor={`name-${idStr}`}>
                                        Name
                                      </Label>
                                      <Input
                                        id={`name-${idStr}`}
                                        name="name"
                                        defaultValue={s.name}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`cat-${idStr}`}>
                                        Category
                                      </Label>
                                      <Input
                                        id={`cat-${idStr}`}
                                        name="category"
                                        defaultValue={s.category}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`price-${idStr}`}>
                                        Price
                                      </Label>
                                      <Input
                                        id={`price-${idStr}`}
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={s.price}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`qty-${idStr}`}>
                                        Quantity
                                      </Label>
                                      <Input
                                        id={`qty-${idStr}`}
                                        name="quantity"
                                        type="number"
                                        min="0"
                                        defaultValue={s.quantity}
                                        required
                                      />
                                    </div>
                                    <DialogFooter className="gap-2">
                                      <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                          Cancel
                                        </Button>
                                      </DialogClose>
                                      <Button type="submit" disabled={busy}>
                                        {busy ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                          </>
                                        ) : (
                                          "Save changes"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </Form>
                                </DialogContent>
                              </Dialog>

                              {/* Restock */}
                              <Dialog>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Restock"
                                      >
                                        <RefreshCcw className="h-4 w-4" />
                                        <span className="sr-only">Restock</span>
                                      </Button>
                                    </DialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>Restock</TooltipContent>
                                </Tooltip>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Restock Sweet</DialogTitle>
                                    <DialogDescription>
                                      Add units to the current stock.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Form method="post" className="grid gap-4">
                                    <input
                                      type="hidden"
                                      name="id"
                                      value={idStr}
                                    />
                                    <input
                                      type="hidden"
                                      name="intent"
                                      value="restock"
                                    />
                                    <div className="grid gap-2">
                                      <Label htmlFor={`restock-${idStr}`}>
                                        Quantity to add
                                      </Label>
                                      <Input
                                        id={`restock-${idStr}`}
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 10"
                                        required
                                      />
                                    </div>
                                    <DialogFooter className="gap-2">
                                      <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                          Cancel
                                        </Button>
                                      </DialogClose>
                                      <Button type="submit" disabled={busy}>
                                        {busy ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                          </>
                                        ) : (
                                          "Add stock"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </Form>
                                </DialogContent>
                              </Dialog>

                              {/* Delete */}
                              <AlertDialog>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete this sweet?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Form
                                    method="post"
                                    id={`delete-form-${idStr}`}
                                  >
                                    <input
                                      type="hidden"
                                      name="id"
                                      value={idStr}
                                    />
                                    <input
                                      type="hidden"
                                      name="intent"
                                      value="delete"
                                    />
                                  </Form>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <Button
                                      type="submit"
                                      form={`delete-form-${idStr}`}
                                      variant="destructive"
                                      disabled={busy}
                                    >
                                      {busy ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Delete"
                                      )}
                                    </Button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-2" />
        <p className="text-xs text-muted-foreground">
          Tip: Use the search and category filters to quickly find items. Keep
          stock levels up to date to avoid overselling.
        </p>
      </main>
    </TooltipProvider>
  );
}
