"use client";

import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/data/products";
import { CartItem } from "@/components/cart/CartItem";
import { useShop } from "@/components/shop/ShopProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function CartPage() {
  const { cart, subtotal, addToCart, removeFromCart, updateCartQuantity } = useShop();
  const savings = cart.reduce((sum, item) => sum + (item.product.mrp - item.product.price) * item.quantity, 0);

  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow="Cart" title="Your almost-home pieces" description="Review your selections before they begin their journey to your home." />
      {cart.length ? (
        <div className="grid gap-6 lg:qh-cart-page-grid">
          <div className="grid gap-4">{cart.map(({ product, quantity }) => (
            <CartItem
              key={product.slug}
              product={product}
              quantity={quantity}
              onDecrease={() => updateCartQuantity(product.slug, quantity - 1)}
              onIncrease={() => addToCart(product)}
              onRemove={() => removeFromCart(product.slug)}
            />
          ))}</div>
          <aside className="qh-card h-fit p-6">
            <h2 className="font-display text-2xl font-semibold">Order Summary</h2>
            <div className="mt-5 grid gap-3 text-text-muted">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-accent-discount"><span>Sale savings</span><span>{formatPrice(savings)}</span></div>
            </div>
            <div className="mt-5 flex justify-between border-t border-border pt-5 text-xl font-bold"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            <Button className="mt-6 w-full" size="lg">Proceed to Checkout</Button>
          </aside>
        </div>
      ) : (
        <div className="qh-card mx-auto max-w-narrow p-8 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-brand-primary" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-text-muted">The best carts begin with one excellent lamp.</p>
          <ButtonLink className="mt-6" href="/search">Start Shopping</ButtonLink>
        </div>
      )}
    </section>
  );
}

