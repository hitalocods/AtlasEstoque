"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  PackagePlus,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, money, number, sameDay } from "@/lib/format";
import type { CompanySettings, InvoiceInfo, Product, ProductCategory, ProductUnit, Sale, SaleItem, StockMovement } from "@/types";

type StoreProps = {
  products: Product[];
  sales: Sale[];
  movements: StockMovement[];
  lowStock: Product[];
  loading: boolean;
  firebaseEnabled: boolean;
  upsertProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  registerMovement: (productId: string, type: "entrada" | "saida" | "ajuste", quantity: number, note?: string) => Promise<void>;
  finalizeSale: (items: SaleItem[], invoiceInfo: InvoiceInfo) => Promise<Sale | null>;
};

type CompanySettingsProps = {
  companySettings: CompanySettings;
  saveCompanySettings: (settings: CompanySettings) => void;
};

const categories: ProductCategory[] = ["Frutas", "Verduras", "Legumes", "Folhagens", "Outros"];
const units: ProductUnit[] = ["kg", "un", "cx", "pct", "dz"];

function parseNumber(value: string, fallback = 0) {
  if (value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function StatCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <Card className="border-[#dce3df] shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-[#142321]">{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-[#dce3df] bg-white p-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

export function DashboardPage({ products, sales, movements, lowStock, loading }: StoreProps) {
  const todaySales = sales.filter((sale) => sameDay(sale.createdAt));
  const todayTotal = todaySales.reduce((total, sale) => total + sale.total, 0);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total de produtos" value={String(products.length)} detail="Itens cadastrados" />
        <StatCard title="Vendas do dia" value={money.format(todayTotal)} detail={`${todaySales.length} venda(s) hoje`} />
        <StatCard title="Estoque baixo" value={String(lowStock.length)} detail="Produtos no limite de alerta" />
        <StatCard title="Notas emitidas" value={String(sales.length)} detail="Notas finalizadas" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-[#dce3df] shadow-sm">
          <CardHeader>
            <CardTitle>Últimas movimentações</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {movements.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.slice(0, 6).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{movement.productName}</TableCell>
                      <TableCell><Badge variant="secondary">{movement.type}</Badge></TableCell>
                      <TableCell className="text-right">{number.format(movement.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Sem movimentações" description="Entradas, saídas, ajustes e vendas aparecerão aqui." />
            )}
          </CardContent>
        </Card>

        <Card className="border-[#dce3df] shadow-sm">
          <CardHeader>
            <CardTitle>Últimas vendas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {sales.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nota</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.slice(0, 6).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.number}</TableCell>
                      <TableCell>{sale.invoiceInfo.client}</TableCell>
                      <TableCell className="text-right">{money.format(sale.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Nenhuma venda" description="As notas finalizadas serão listadas nesta tabela." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductForm({
  product,
  onSave,
  onSaved,
}: {
  product?: Product;
  onSave: StoreProps["upsertProduct"];
  onSaved?: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "Frutas");
  const [unit, setUnit] = useState<ProductUnit>(product?.unit ?? "kg");
  const [stockQuantity, setStockQuantity] = useState(product ? String(product.stockQuantity) : "");
  const [costPrice, setCostPrice] = useState(product ? String(product.costPrice) : "");
  const [salePrice, setSalePrice] = useState(product ? String(product.salePrice) : "");
  const [lowStockAlert, setLowStockAlert] = useState(product ? String(product.lowStockAlert) : "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    await onSave({
      id: product?.id,
      name,
      category,
      unit,
      stockQuantity: parseNumber(stockQuantity),
      costPrice: parseNumber(costPrice),
      salePrice: parseNumber(salePrice),
      lowStockAlert: parseNumber(lowStockAlert, 10),
    });
    onSaved?.();
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as ProductCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Unidade</Label>
          <Select value={unit} onValueChange={(value) => setUnit(value as ProductUnit)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{units.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber label="Quantidade estoque" placeholder="Ex: 120" value={stockQuantity} setValue={setStockQuantity} />
        <FieldNumber label="Alerta estoque baixo" placeholder="Ex: 20" value={lowStockAlert} setValue={setLowStockAlert} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber label="Preço custo" value={costPrice} setValue={setCostPrice} />
        <FieldNumber label="Preço venda" value={salePrice} setValue={setSalePrice} />
      </div>
      <DialogFooter>
        <Button className="h-11 bg-[#0f2b2e] hover:bg-[#153a3d]">Salvar produto</Button>
      </DialogFooter>
    </form>
  );
}

function FieldNumber({
  label,
  value,
  setValue,
  placeholder = "Digite o valor",
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}

function ProductDialog({
  product,
  onSave,
  trigger,
}: {
  product?: Product;
  onSave: StoreProps["upsertProduct"];
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar produto" : "Criar produto"}</DialogTitle>
        </DialogHeader>
        <ProductForm
          product={product}
          onSave={onSave}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ProductsPage({ products, upsertProduct, removeProduct }: StoreProps) {
  const [query, setQuery] = useState("");
  const filtered = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="h-11 pl-10" placeholder="Buscar produto" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <ProductDialog
          onSave={upsertProduct}
          trigger={
            <Button className="h-11 gap-2 bg-[#0f2b2e] hover:bg-[#153a3d]">
              <Plus className="h-4 w-4" /> Novo produto
            </Button>
          }
        />
      </div>

      <Card className="border-[#dce3df] shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço venda</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant={product.stockQuantity <= product.lowStockAlert ? "destructive" : "secondary"}>
                        {number.format(product.stockQuantity)} {product.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>{money.format(product.salePrice)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ProductDialog
                          product={product}
                          onSave={upsertProduct}
                          trigger={
                            <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação remove o cadastro do produto.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeProduct(product.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!filtered.length && <div className="p-4"><EmptyState title="Produto não encontrado" description="Ajuste a busca ou cadastre um novo produto." /></div>}
        </CardContent>
      </Card>
    </div>
  );
}

export function StockPage({ products, registerMovement, lowStock }: StoreProps) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<"entrada" | "saida" | "ajuste">("entrada");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = parseNumber(quantity);
    if (parsedQuantity <= 0 && type !== "ajuste") {
      toast.error("Informe uma quantidade válida.");
      return;
    }
    await registerMovement(productId, type, parsedQuantity, note);
    setQuantity("");
    setNote("");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-[#dce3df] shadow-sm">
        <CardHeader><CardTitle>Movimentação manual</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label>Produto</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(value) => setType(value as "entrada" | "saida" | "ajuste")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FieldNumber
                label={type === "ajuste" ? "Novo estoque" : "Quantidade"}
                placeholder={type === "ajuste" ? "Ex: 85" : "Ex: 12"}
                value={quantity}
                setValue={setQuantity}
              />
            </div>
            <div className="grid gap-2">
              <Label>Observação</Label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Conferência, perda, entrada de carga..." />
            </div>
            <Button className="h-12 w-full gap-2 bg-[#0f2b2e] hover:bg-[#153a3d]"><PackagePlus className="h-4 w-4" /> Registrar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[#dce3df] shadow-sm">
        <CardHeader><CardTitle>Estoque atual</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {lowStock.length > 0 && (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {lowStock.length} produto(s) com estoque baixo.
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead className="text-right">Disponível</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right font-medium">{number.format(product.stockQuantity)} {product.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SalesPage({ products, finalizeSale, companySettings }: StoreProps & CompanySettingsProps) {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [invoice, setInvoice] = useState<InvoiceInfo>({
    companyName: companySettings.companyName,
    cnpj: companySettings.cnpj,
    phone: companySettings.phone,
    address: companySettings.address,
    client: "",
    observations: "",
  });
  const total = items.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    let active = true;

    async function syncCompanySettings() {
      await Promise.resolve();
      if (!active) return;
      setInvoice((current) => ({
        ...current,
        companyName: companySettings.companyName,
        cnpj: companySettings.cnpj,
        phone: companySettings.phone,
        address: companySettings.address,
      }));
    }

    syncCompanySettings();

    return () => {
      active = false;
    };
  }, [companySettings]);

  function addItem() {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const parsedQuantity = parseNumber(quantity);
    if (parsedQuantity <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }
    const existing = items.find((item) => item.productId === product.id);
    const nextQuantity = (existing?.quantity ?? 0) + parsedQuantity;
    if (nextQuantity > product.stockQuantity) {
      toast.error("Quantidade maior que o estoque disponível.");
      return;
    }
    setItems((current) =>
      existing
        ? current.map((item) => item.productId === product.id ? { ...item, quantity: nextQuantity, total: nextQuantity * item.unitPrice } : item)
        : [...current, { productId: product.id, productName: product.name, unit: product.unit, quantity: parsedQuantity, unitPrice: product.salePrice, total: parsedQuantity * product.salePrice }],
    );
    setQuantity("");
  }

  function updateQty(productIdToUpdate: string, nextQuantity: number) {
    const product = products.find((item) => item.id === productIdToUpdate);
    if (!product || nextQuantity < 1) return;
    if (nextQuantity > product.stockQuantity) {
      toast.error("Estoque insuficiente.");
      return;
    }
    setItems((current) => current.map((item) => item.productId === productIdToUpdate ? { ...item, quantity: nextQuantity, total: nextQuantity * item.unitPrice } : item));
  }

  async function finish() {
    if (!invoice.companyName || !invoice.client) {
      toast.error("Informe empresa e cliente antes de imprimir.");
      return;
    }
    const sale = await finalizeSale(items, invoice);
    if (sale) {
      setItems([]);
      window.open(`/print/${sale.id}`, "_blank");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card className="border-[#dce3df] shadow-sm">
        <CardHeader><CardTitle>PDV simples</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Produto" /></SelectTrigger>
              <SelectContent>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.name} | {money.format(product.salePrice)}</SelectItem>)}</SelectContent>
            </Select>
            <Input className="h-12" type="number" min="1" step="0.01" placeholder="Qtd." value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            <Button className="h-12 gap-2 bg-[#0f2b2e] hover:bg-[#153a3d]" onClick={addItem}><Plus className="h-4 w-4" /> Adicionar</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Qtd.</TableHead><TableHead>Unit.</TableHead><TableHead className="text-right">Total</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell><Input className="h-10 w-24" type="number" min="1" step="0.01" value={item.quantity} onChange={(event) => updateQty(item.productId, Number(event.target.value))} /></TableCell>
                    <TableCell>{money.format(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{money.format(item.total)}</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="icon" onClick={() => setItems((current) => current.filter((row) => row.productId !== item.productId))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!items.length && <EmptyState title="Nota em aberto" description="Adicione produtos. O estoque só será baixado ao finalizar e imprimir." />}
        </CardContent>
      </Card>

      <Card className="border-[#dce3df] shadow-sm">
        <CardHeader><CardTitle>Finalização da nota</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {([
            ["companyName", "Nome empresa"],
            ["cnpj", "CNPJ"],
            ["phone", "Telefone"],
            ["address", "Endereço"],
            ["client", "Cliente"],
          ] as const).map(([key, label]) => (
            <div className="grid gap-2" key={key}>
              <Label>{label}</Label>
              <Input value={invoice[key]} onChange={(event) => setInvoice({ ...invoice, [key]: event.target.value })} />
            </div>
          ))}
          <div className="grid gap-2">
            <Label>Observações</Label>
            <Textarea value={invoice.observations} onChange={(event) => setInvoice({ ...invoice, observations: event.target.value })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-3xl font-semibold">{money.format(total)}</span>
          </div>
          <Button className="h-12 w-full gap-2 bg-[#d9a928] text-[#0f2b2e] hover:bg-[#c89a1f]" onClick={finish}>
            <Printer className="h-4 w-4" /> Finalizar e imprimir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotesPage({ sales }: StoreProps) {
  return (
    <Card className="border-[#dce3df] shadow-sm">
      <CardHeader><CardTitle>Notas emitidas</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Nota</TableHead><TableHead>Cliente</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Total</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.number}</TableCell>
                <TableCell>{sale.invoiceInfo.client}</TableCell>
                <TableCell>{formatDate(sale.createdAt)}</TableCell>
                <TableCell className="text-right">{money.format(sale.total)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" className="gap-2" onClick={() => window.open(`/print/${sale.id}`, "_blank")}>
                    <FileDown className="h-4 w-4" /> Imprimir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!sales.length && <EmptyState title="Sem notas emitidas" description="Finalize uma venda para gerar a página de impressão." />}
      </CardContent>
    </Card>
  );
}

export function HistoryPage({ movements }: StoreProps) {
  return (
    <Card className="border-[#dce3df] shadow-sm">
      <CardHeader><CardTitle>Histórico operacional</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Produto</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Anterior</TableHead><TableHead className="text-right">Atual</TableHead></TableRow></TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>{formatDate(movement.createdAt)}</TableCell>
                <TableCell className="font-medium">{movement.productName}</TableCell>
                <TableCell><Badge variant="secondary">{movement.type}</Badge></TableCell>
                <TableCell className="text-right">{number.format(movement.previousQuantity)}</TableCell>
                <TableCell className="text-right">{number.format(movement.newQuantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function SettingsPage({
  firebaseEnabled,
  companySettings,
  saveCompanySettings,
}: StoreProps & CompanySettingsProps) {
  const [settings, setSettings] = useState<CompanySettings>(companySettings);

  useEffect(() => {
    let active = true;

    async function syncSettings() {
      await Promise.resolve();
      if (active) setSettings(companySettings);
    }

    syncSettings();

    return () => {
      active = false;
    };
  }, [companySettings]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings.companyName.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    saveCompanySettings(settings);
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="border-[#dce3df] shadow-sm">
        <CardHeader><CardTitle>Dados da empresa</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label>Nome da empresa</Label>
              <Input
                placeholder="Ex: Atlas Hortifruti LTDA"
                value={settings.companyName}
                onChange={(event) =>
                  setSettings({ ...settings, companyName: event.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>CNPJ</Label>
                <Input
                  placeholder="Ex: 00.000.000/0001-00"
                  value={settings.cnpj}
                  onChange={(event) =>
                    setSettings({ ...settings, cnpj: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="Ex: (11) 99999-9999"
                  value={settings.phone}
                  onChange={(event) =>
                    setSettings({ ...settings, phone: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Endereco</Label>
              <Textarea
                placeholder="Ex: CEASA, box 12, pavilhao..."
                value={settings.address}
                onChange={(event) =>
                  setSettings({ ...settings, address: event.target.value })
                }
              />
            </div>
            <Button className="h-11 bg-[#0f2b2e] hover:bg-[#153a3d]">
              Salvar dados
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-[#dce3df] shadow-sm">
        <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3 rounded-lg border border-[#dce3df] bg-white p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-[#142321]">Firestore Database</p>
              <p>{firebaseEnabled ? "Conectado via variáveis de ambiente." : "Modo local até configurar Firebase."}</p>
            </div>
          </div>
          <p>Coleções previstas: users, products, sales e stock_movements.</p>
        </CardContent>
      </Card>
    </div>
  );
}
