'use client';
import Button from '@/components/Button';

import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import { Utensils, ShoppingCart, Plus, Minus, Check, Clock, Trash2, Heart, Award } from 'lucide-react';
import { useState } from 'react';

export default function FoodPage() {
  const { cart, addToCart, removeFromCart, clearCart, orderHistory, addOrderToHistory } = useStore();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [veganOnly, setVeganOnly] = useState(false);
  const [glutenFreeOnly, setGlutenFreeOnly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart');

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get('/api/food/vendors').then((res) => res.data),
  });

  // Set the first vendor as default selected vendor on load
  const activeVendorId = selectedVendorId || (vendors && vendors.length > 0 ? vendors[0].id : null);
  const activeVendor = vendors?.find((v: any) => v.id === activeVendorId);

  const placeOrderMutation = useMutation({
    mutationFn: (data: { vendorId: string; items: { itemId: string; quantity: number }[] }) =>
      api.post('/api/food/order', data),
    onSuccess: (response) => {
      const orderItems = cart.map((c) => ({
        name: c.name,
        quantity: c.quantity,
        price: c.price,
      }));
      addOrderToHistory({
        orderId: response.data.orderId,
        vendorName: response.data.vendorName,
        location: response.data.location,
        status: response.data.status,
        estimatedWaitMinutes: response.data.estimatedWaitMinutes,
        queueNumber: response.data.queueNumber,
        createdAt: response.data.createdAt || new Date().toISOString(),
        items: orderItems,
      });
      setOrderReceipt(response.data);
      clearCart();
      setIsOpen(true);
      setActiveTab('history');
    },
  });

  const handlePlaceOrder = () => {
    if (cart.length === 0 || !activeVendorId) return;
    const items = cart.map((c) => ({ itemId: c.itemId, quantity: c.quantity }));
    placeOrderMutation.mutate({ vendorId: activeVendorId, items });
  };

  const getFilteredItems = () => {
    if (!activeVendor) return [];
    let items = activeVendor.items;
    if (veganOnly) {
      items = items.filter((item: any) => item.isVegan);
    }
    if (glutenFreeOnly) {
      items = items.filter((item: any) => item.isGlutenFree);
    }
    return items;
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Vendors Selection List */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="font-bold text-sm text-default-600 pl-1 uppercase tracking-wider">Food Vendors</h3>
            
            {vendorsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : vendors && vendors.length > 0 ? (
              <div className="space-y-3">
                {vendors.map((vendor: any) => {
                  const isActive = vendor.id === activeVendorId;
                  return (
                    <Card
                      key={vendor.id}
                      onClick={() => {
                        setSelectedVendorId(vendor.id);
                        setVeganOnly(false);
                        setGlutenFreeOnly(false);
                      }}
                      className={`cursor-pointer hover:border-primary-300 transition-all border ${
                        isActive ? 'border-primary-500 bg-primary-50/10' : 'border-default-100 bg-content1/50'
                      }`}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-sm text-foreground">{vendor.name}</p>
                          <Chip size="sm" variant="soft" color="accent" className="text-[10px]">
                            {vendor.status}
                          </Chip>
                        </div>
                        <p className="text-[10px] text-default-400">{vendor.cuisine} • {vendor.location}</p>
                        <div className="flex items-center gap-1 text-[10px] text-default-500 font-medium">
                          <Clock size={10} className="text-primary-500" />
                          <span>Wait time: ~{vendor.waitTimeMinutes} mins</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-default-400">No concession stands are open.</p>
            )}
          </div>

          {/* Selected Vendor's Menu Items */}
          <div className="space-y-4 lg:col-span-2">
            {activeVendor ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{activeVendor.name} Menu</h3>
                    <p className="text-xs text-default-400">{activeVendor.cuisine} • {activeVendor.location}</p>
                  </div>

                  {/* Dietary Filter Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={veganOnly ? 'primary' : 'ghost'}
                      color="success"
                      radius="full"
                      className="text-[10px] font-semibold h-7"
                      onPress={() => setVeganOnly(!veganOnly)}
                    >
                      Vegan
                    </Button>
                    <Button
                      size="sm"
                      variant={glutenFreeOnly ? 'primary' : 'ghost'}
                      color="secondary"
                      radius="full"
                      className="text-[10px] font-semibold h-7"
                      onPress={() => setGlutenFreeOnly(!glutenFreeOnly)}
                    >
                      Gluten-Free
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {getFilteredItems().map((item: any) => {
                    const cartItem = cart.find((c) => c.itemId === item.id);
                    return (
                      <Card key={item.id} className="border border-default-100 bg-content1/50">
                        <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-sm text-foreground">{item.name}</p>
                              <span className="text-xs font-bold text-primary-500">${item.price.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-default-500 leading-relaxed truncate-2-lines">
                              {item.description}
                            </p>
                            <div className="flex gap-1.5 pt-1">
                              {item.isVegan && (
                                <Chip size="sm" color="success" variant="soft" className="h-4 text-[8px] font-bold">
                                  VEGAN
                                </Chip>
                              )}
                              {item.isGlutenFree && (
                                <Chip size="sm" color="default" variant="soft" className="h-4 text-[8px] font-bold">
                                  GF
                                </Chip>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {cartItem ? (
                              <div className="flex items-center gap-2 bg-default-100 p-0.5 rounded-lg border border-default-200">
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="ghost"
                                  className="w-6 h-6 min-w-6"
                                  onPress={() => removeFromCart(item.id)}
                                >
                                  <Minus size={10} />
                                </Button>
                                <span className="text-xs font-bold px-1.5">{cartItem.quantity}</span>
                                <Button
                                  size="sm"
                                  isIconOnly
                                  variant="ghost"
                                  className="w-6 h-6 min-w-6"
                                  onPress={() => addToCart({ id: item.id, name: item.name, price: item.price, vendorId: activeVendor.id })}
                                >
                                  <Plus size={10} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                color="primary"
                                variant="ghost"
                                className="font-semibold rounded-xl w-full"
                                onPress={() => addToCart({ id: item.id, name: item.name, price: item.price, vendorId: activeVendor.id })}
                                endContent={<Plus size={12} />}
                              >
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-default-400">Loading menu content...</div>
            )}
          </div>

          {/* Concessions Shopping Cart */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex justify-between items-center pr-1">
              <h3 className="font-bold text-sm text-default-600 uppercase tracking-wider">Your Order</h3>
              
              {/* Tab Selector */}
              <div className="flex bg-default-100 dark:bg-default-800/40 p-0.5 rounded-lg text-[9px] font-bold">
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    activeTab === 'cart' 
                      ? 'bg-primary-500 text-white shadow-sm' 
                      : 'text-default-500 hover:text-foreground'
                  }`}
                >
                  Cart ({cart.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    activeTab === 'history' 
                      ? 'bg-primary-500 text-white shadow-sm' 
                      : 'text-default-500 hover:text-foreground'
                  }`}
                >
                  My Orders ({orderHistory?.length || 0})
                </button>
              </div>
            </div>
            
            <Card className="glass-card border border-default-100 shadow-sm h-[400px] flex flex-col justify-between">
              {activeTab === 'cart' ? (
                <>
                  <CardContent className="p-4 overflow-y-auto space-y-4 flex-1">
                    <div className="flex items-center gap-1.5 text-primary-500 mb-2 border-b border-default-100 pb-2">
                      <ShoppingCart size={16} />
                      <span className="text-xs font-bold">Cart Items ({cart.length})</span>
                    </div>

                    {cart.length > 0 ? (
                      <div className="space-y-3">
                        {cart.map((cartItem) => (
                          <div key={cartItem.itemId} className="flex justify-between items-start text-xs border-b border-default-50 pb-2">
                            <div className="space-y-0.5 overflow-hidden pr-2">
                              <p className="font-semibold truncate">{cartItem.name}</p>
                              <p className="text-[9px] text-default-400">
                                {cartItem.quantity} x ${cartItem.price.toFixed(2)}
                              </p>
                            </div>
                            <span className="font-bold text-foreground">
                              ${(cartItem.price * cartItem.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-default-400 gap-2">
                        <ShoppingCart size={24} className="text-default-300" />
                        <p className="text-[10px]">Your cart is empty.</p>
                      </div>
                    )}
                  </CardContent>

                  {cart.length > 0 && (
                    <div className="p-4 border-t border-default-100 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Total Amount</span>
                        <span className="text-primary-500">${cartTotal.toFixed(2)}</span>
                      </div>

                      <Button
                        color="primary"
                        size="sm"
                        className="w-full font-semibold rounded-xl"
                        onPress={handlePlaceOrder}
                        isLoading={placeOrderMutation.isPending}
                      >
                        Place Pre-Order
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <CardContent className="p-4 overflow-y-auto space-y-4 flex-1">
                  <div className="flex items-center gap-1.5 text-primary-500 mb-2 border-b border-default-100 pb-2">
                    <Clock size={16} />
                    <span className="text-xs font-bold">Order History</span>
                  </div>

                  {orderHistory && orderHistory.length > 0 ? (
                    <div className="space-y-3 pb-2">
                      {orderHistory.map((order, idx) => (
                        <div key={idx} className="p-3 bg-default-50/60 dark:bg-default-800/10 rounded-xl border border-default-100 space-y-2 text-[10px]">
                          <div className="flex justify-between items-center border-b border-default-50 pb-1.5">
                            <span className="font-mono text-[8px] text-default-400">ID: #{order.orderId}</span>
                            <Chip size="sm" color="accent" variant="soft" className="text-[8px] font-extrabold h-4.5">
                              {order.status}
                            </Chip>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-foreground text-xs">{order.vendorName}</p>
                            <p className="text-[9px] text-default-400">{order.location}</p>
                            <div className="space-y-0.5 pt-1 border-t border-default-50/50 mt-1">
                              {order.items.map((item, itemIdx) => (
                                <p key={itemIdx} className="text-default-500 font-medium">
                                  {item.quantity} x {item.name}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t border-default-50 pt-1.5 text-default-400">
                            <span>Wait time: ~{order.estimatedWaitMinutes} mins</span>
                            <span>
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-default-400 gap-2">
                      <Utensils size={24} className="text-default-300" />
                      <p className="text-[10px]">No pre-orders placed yet.</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Success Receipt Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-background border border-default-200 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 animate-scale-in relative">
            <div className="flex flex-col gap-1 items-center pt-8">
              <div className="p-3 bg-success-50 rounded-full text-success-600 mb-2">
                <Check size={28} />
              </div>
              <h3 className="text-lg font-bold text-foreground">Order Successfully Placed!</h3>
              <p className="text-[10px] text-default-400 font-medium">SHOW THIS BARCODE AT PICKUP CORRIDOR</p>
            </div>
            <div className="px-4 py-2 space-y-4">
              {orderReceipt && (
                <div className="space-y-4">
                  {/* Simulated barcode */}
                  <div className="border border-default-200 rounded-xl p-4 bg-white flex flex-col items-center justify-center gap-2">
                    <div className="w-full h-12 bg-[repeating-linear-gradient(90deg,black_2px,transparent_2px,black_4px,transparent_6px)] bg-[size:10px_100%] opacity-85"></div>
                    <p className="text-[9px] font-mono tracking-widest text-default-500">
                      ORDER-ID-{orderReceipt.orderId}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-default-500">Vendor</span>
                      <span className="font-bold text-foreground">{orderReceipt.vendorName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-default-500">Location</span>
                      <span className="font-semibold text-foreground">{orderReceipt.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-default-500">Estimated Ready Time</span>
                      <span className="font-bold text-success-600 flex items-center gap-1">
                        <Clock size={12} />
                        {orderReceipt.estimatedWaitMinutes} mins
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-default-500">Your Queue Spot</span>
                      <Chip size="sm" color="accent" variant="soft" className="font-bold h-5">
                        #{orderReceipt.queueNumber}
                      </Chip>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="pb-4 pt-2">
              <Button color="primary" radius="xl" className="w-full font-semibold" onPress={() => setIsOpen(false)}>
                Back to Food Court
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}





