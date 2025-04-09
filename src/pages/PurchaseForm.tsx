import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft, Cpu, HardDrive, Gauge, Signal, Cloud } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const allPlans = [
  // Vanilla plans
  {
    id: "getting-woods",
    name: "Getting Woods",
    price: 149,
    category: "PLAY VANILLA",
    specs: {
      ram: "2GB RAM",
      cpu: "100% CPU",
      storage: "10GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "",
    },
    players: "10+ Players"
  },
  {
    id: "getting-an-upgrade",
    name: "Getting an Upgrade",
    price: 339,
    category: "PLAY VANILLA",
    specs: {
      ram: "4GB RAM",
      cpu: "200% CPU",
      storage: "15GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "",
    },
    players: "20+ Players"
  },
  {
    id: "stone-age",
    name: "Stone Age",
    price: 529,
    category: "PLAY VANILLA",
    specs: {
      ram: "6GB RAM",
      cpu: "250% CPU",
      storage: "20GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "",
    },
    players: "30+ Players"
  },
  {
    id: "acquire-hardware",
    name: "Acquire Hardware",
    price: 699,
    category: "PLAY VANILLA",
    specs: {
      ram: "8GB RAM",
      cpu: "300% CPU",
      storage: "25GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "",
    },
    players: "45+ Players"
  },
  
  // Modpack plans
  {
    id: "isnt-it-iron-pick",
    name: "Isn't It Iron Pick?",
    price: 859,
    category: "PLAY WITH MODPACKS",
    specs: {
      ram: "10GB RAM",
      cpu: "350% CPU",
      storage: "30GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "",
    },
    players: "60+ Players"
  },
  {
    id: "diamonds",
    name: "Diamonds",
    price: 1029,
    category: "PLAY WITH MODPACKS",
    specs: {
      ram: "12GB RAM",
      cpu: "400% CPU",
      storage: "35GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "",
    },
    players: "75+ Players"
  },
  {
    id: "ice-bucket-challenge",
    name: "Ice Bucket Challenge",
    price: 1399,
    category: "PLAY WITH MODPACKS",
    specs: {
      ram: "16GB RAM",
      cpu: "450% CPU",
      storage: "40GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "",
    },
    players: "90+ Players"
  },
  
  // Community server plans
  {
    id: "we-need-to-go-deeper",
    name: "We Need to Go Deeper",
    price: 1699,
    category: "START A COMMUNITY SERVER",
    specs: {
      ram: "20GB RAM",
      cpu: "450% CPU",
      storage: "45GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "1 Cloud Backup",
    },
    players: "120+ Players"
  },
  {
    id: "hidden-in-the-depths",
    name: "Hidden in the Depths",
    price: 2119,
    category: "START A COMMUNITY SERVER",
    specs: {
      ram: "24GB RAM",
      cpu: "500% CPU",
      storage: "50GB SSD",
      bandwidth: "1Gbps Bandwidth",
      backups: "1 Cloud Backup",
    },
    players: "150+ Players"
  },
  {
    id: "the-end",
    name: "The End",
    price: 2899,
    category: "START A COMMUNITY SERVER",
    specs: {
      ram: "32GB RAM",
      cpu: "600% CPU",
      storage: "80GB SSD",
      bandwidth: "Unmetered Bandwidth",
      backups: "2 Cloud Backups",
    },
    players: "200+ Players"
  },
  {
    id: "sky-is-the-limit",
    name: "Sky is the Limit",
    price: 3399,
    category: "START A COMMUNITY SERVER",
    specs: {
      ram: "64GB RAM",
      cpu: "800% CPU",
      storage: "100GB SSD",
      bandwidth: "Unmetered Bandwidth",
      backups: "2 Cloud Backups",
    },
    players: "300+ Players"
  },
];

const PurchaseForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    serverName: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    discordUsername: "",
    plan: "",
    additionalBackups: "0",
    additionalPorts: "0"
  });
  const [selectedPlan, setSelectedPlan] = useState<typeof allPlans[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMonthlyBilling, setIsMonthlyBilling] = useState(true);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planFromUrl = queryParams.get('plan');
    
    if (planFromUrl) {
      setFormData(prev => ({ ...prev, plan: planFromUrl }));
      const plan = allPlans.find(p => p.id === planFromUrl);
      setSelectedPlan(plan || null);
    }
  }, [location.search]);
  
  const calculateTotalPrice = () => {
    if (!selectedPlan) return 0;
    
    const basePrice = isMonthlyBilling 
      ? Math.round(selectedPlan.price * 1.25) 
      : selectedPlan.price;
      
    const backupPrice = parseInt(formData.additionalBackups) * 19;
    const portPrice = parseInt(formData.additionalPorts) * 9;
    
    return basePrice + backupPrice + portPrice;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "plan") {
      const plan = allPlans.find(p => p.id === value);
      setSelectedPlan(plan || null);
    }
  };

  const getSpecIcon = (spec: string) => {
    if (spec.includes("RAM")) return <Gauge className="w-5 h-5 flex-shrink-0 text-minecraft-secondary" />;
    if (spec.includes("CPU")) return <Cpu className="w-5 h-5 flex-shrink-0 text-minecraft-secondary" />;
    if (spec.includes("SSD") || spec.includes("storage")) return <HardDrive className="w-5 h-5 flex-shrink-0 text-minecraft-secondary" />;
    if (spec.includes("Bandwidth")) return <Signal className="w-5 h-5 flex-shrink-0 text-minecraft-secondary" />;
    if (spec.includes("Backup")) return <Cloud className="w-5 h-5 flex-shrink-0 text-minecraft-secondary" />;
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serverName || !formData.name || !formData.email || !formData.password || !formData.plan) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    const totalPrice = calculateTotalPrice();
    const billingCycle = isMonthlyBilling ? 1 : 3;
    
    navigate("/payment", { 
      state: {
        ...formData,
        totalPrice,
        billingCycle
      }
    });
  };

  const getPlanPrice = (originalPrice: number) => {
    return isMonthlyBilling 
      ? Math.round(originalPrice * 1.25) 
      : originalPrice;
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/lovable-uploads/9de719a9-cca7-4faa-bc79-f87f3245bd99.png")',
          backgroundPosition: '50% 20%',
          zIndex: 0
        }}
      />
      
      <div className="fixed inset-0 bg-gradient-to-t from-minecraft-dark via-black/85 to-black/40 z-0" />
      
      <div
        className="fixed inset-0 grid-background z-0"
        style={{
          opacity: 0.06,
          backgroundSize: "35px 35px",
        }}
      />

      <Button
        variant="ghost"
        size="sm"
        className="absolute top-8 left-8 text-white z-20 md:top-8 md:left-8"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <main className="flex-grow relative z-10">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Purchase Your Minecraft Server
              </h1>
              <p className="text-gray-400">
                Fill in the details below to get started.
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-center mb-8">
                <div className="flex w-full bg-black/40 rounded-lg border border-white/10 p-1">
                  <button
                    onClick={() => setIsMonthlyBilling(true)}
                    className={`relative flex-1 py-2 px-3 rounded-md transition-all duration-300 ${
                      isMonthlyBilling 
                        ? "" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {isMonthlyBilling && (
                      <div className="absolute inset-0 bg-minecraft-secondary rounded-md transition-transform duration-300 ease-in-out" />
                    )}
                    <span className="relative block text-sm">1 Month</span>
                    <span className={`relative text-xs ${isMonthlyBilling ? "text-white/80" : "text-gray-500"}`}>
                      Standard Price
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setIsMonthlyBilling(false)}
                    className={`relative flex-1 py-2 px-3 rounded-md transition-all duration-300 ${
                      !isMonthlyBilling 
                        ? "" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {!isMonthlyBilling && (
                      <div className="absolute inset-0 bg-minecraft-secondary rounded-md transition-transform duration-300 ease-in-out" />
                    )}
                    <span className="relative block text-sm">3 Months</span>
                    <span className={`relative text-xs ${!isMonthlyBilling ? "text-white/80" : "text-gray-500"}`}>
                      Save 25%
                    </span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="serverName"
                    className="text-sm font-medium text-white/90"
                  >
                    Server Name
                  </label>
                  <Input
                    id="serverName"
                    name="serverName"
                    placeholder="Enter your preferred server name"
                    value={formData.serverName}
                    onChange={handleChange}
                    className="bg-black/70 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-white/90"
                  >
                    Your Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-black/70 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white/90"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-black/70 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="discordUsername"
                    className="text-sm font-medium text-white/90"
                  >
                    Discord Username
                  </label>
                  <Input
                    id="discordUsername"
                    name="discordUsername"
                    placeholder="Your Discord Username"
                    value={formData.discordUsername}
                    onChange={handleChange}
                    className="bg-black/70 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-white/90"
                  >
                    Phone Number (Optional)
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Your Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-black/70 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white/90"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-black/70 border-white/10 text-white placeholder:text-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-400">This will be your server login password.</p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="plan"
                    className="text-sm font-medium text-white/90"
                  >
                    Select a Plan
                  </label>
                  <Select
                    name="plan"
                    onValueChange={(value) => handleSelectChange("plan", value)}
                  >
                    <SelectTrigger
                      id="plan"
                      className="w-full bg-black/70 border-white/10 text-white"
                    >
                      <SelectValue placeholder="Select a Plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white max-h-80">
                      <div className="p-1 text-xs uppercase text-white/50 font-medium">PLAY VANILLA</div>
                      {allPlans.filter(p => p.category === "PLAY VANILLA").map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₹{getPlanPrice(plan.price)}/month
                        </SelectItem>
                      ))}
                      
                      <div className="p-1 mt-2 text-xs uppercase text-white/50 font-medium">PLAY WITH MODPACKS</div>
                      {allPlans.filter(p => p.category === "PLAY WITH MODPACKS").map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₹{getPlanPrice(plan.price)}/month
                        </SelectItem>
                      ))}
                      
                      <div className="p-1 mt-2 text-xs uppercase text-white/50 font-medium">COMMUNITY SERVERS</div>
                      {allPlans.filter(p => p.category === "START A COMMUNITY SERVER").map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₹{getPlanPrice(plan.price)}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlan && (
                  <>
                    <div className="space-y-3 bg-black/70 border border-white/10 rounded-md p-4 mt-4 backdrop-blur-sm">
                      <h3 className="font-medium text-white flex items-center gap-2">
                        <span>{selectedPlan.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/70">
                          {selectedPlan.players}
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          {getSpecIcon(selectedPlan.specs.ram)}
                          <span className="text-sm text-white/80">{selectedPlan.specs.ram}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSpecIcon(selectedPlan.specs.cpu)}
                          <span className="text-sm text-white/80">{selectedPlan.specs.cpu}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSpecIcon(selectedPlan.specs.storage)}
                          <span className="text-sm text-white/80">{selectedPlan.specs.storage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSpecIcon(selectedPlan.specs.bandwidth)}
                          <span className="text-sm text-white/80">{selectedPlan.specs.bandwidth}</span>
                        </div>
                        {selectedPlan.specs.backups && (
                          <div className="flex items-center gap-2">
                            {getSpecIcon(selectedPlan.specs.backups)}
                            <span className="text-sm text-white/80">{selectedPlan.specs.backups}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                        <span className="text-sm font-medium text-white">Price:</span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-white">₹{getPlanPrice(selectedPlan.price)}</span>
                          <span className="text-sm text-white/70 ml-1">/{isMonthlyBilling ? 'month' : '3 months'}</span>
                        </div>
                      </div>
                      
                      {isMonthlyBilling && (
                        <div className="text-xs text-minecraft-secondary text-right">
                          Switch to 3 months billing and save 25%
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-black/70 border border-white/10 rounded-md p-4 space-y-4">
                      <h3 className="font-medium text-white">Additional Options</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/90">
                          Additional Cloud Backups (₹19 each)
                        </label>
                        <Select
                          name="additionalBackups"
                          value={formData.additionalBackups}
                          onValueChange={(value) => handleSelectChange("additionalBackups", value)}
                        >
                          <SelectTrigger className="w-full bg-black/70 border-white/10 text-white">
                            <SelectValue placeholder="Select number of additional backups" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
                            <SelectItem value="0">No additional backups</SelectItem>
                            <SelectItem value="1">1 additional backup (+₹19)</SelectItem>
                            <SelectItem value="2">2 additional backups (+₹38)</SelectItem>
                            <SelectItem value="3">3 additional backups (+₹57)</SelectItem>
                            <SelectItem value="4">4 additional backups (+₹76)</SelectItem>
                            <SelectItem value="5">5 additional backups (+₹95)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/90">
                          Additional Ports (₹9 each)
                        </label>
                        <Select
                          name="additionalPorts"
                          value={formData.additionalPorts}
                          onValueChange={(value) => handleSelectChange("additionalPorts", value)}
                        >
                          <SelectTrigger className="w-full bg-black/70 border-white/10 text-white">
                            <SelectValue placeholder="Select number of additional ports" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
                            <SelectItem value="0">No additional ports</SelectItem>
                            <SelectItem value="1">1 additional port (+₹9)</SelectItem>
                            <SelectItem value="2">2 additional ports (+₹18)</SelectItem>
                            <SelectItem value="3">3 additional ports (+₹27)</SelectItem>
                            <SelectItem value="4">4 additional ports (+₹36)</SelectItem>
                            <SelectItem value="5">5 additional ports (+₹45)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(parseInt(formData.additionalBackups) > 0 || parseInt(formData.additionalPorts) > 0) && (
                        <div className="mt-4 p-3 bg-minecraft-accent/10 rounded-md border border-minecraft-accent/20">
                          <div className="flex justify-between text-white">
                            <span>Base plan price:</span>
                            <span>₹{getPlanPrice(selectedPlan.price)}</span>
                          </div>
                          {parseInt(formData.additionalBackups) > 0 && (
                            <div className="flex justify-between text-white">
                              <span>Additional backups ({formData.additionalBackups}):</span>
                              <span>+₹{parseInt(formData.additionalBackups) * 19}</span>
                            </div>
                          )}
                          {parseInt(formData.additionalPorts) > 0 && (
                            <div className="flex justify-between text-white">
                              <span>Additional ports ({formData.additionalPorts}):</span>
                              <span>+₹{parseInt(formData.additionalPorts) * 9}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-white font-bold mt-2 pt-2 border-t border-white/20">
                            <span>Total price:</span>
                            <span>₹{calculateTotalPrice()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full py-6 mt-6 bg-gradient-to-r from-minecraft-primary to-minecraft-secondary hover:from-minecraft-primary/90 hover:to-minecraft-secondary/90 text-white font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(94,66,227,0.3)] button-texture"
                  disabled={isSubmitting}
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>
                By proceeding, you agree to our{" "}
                <Link
                  to="/terms-of-service"
                  className="text-minecraft-secondary hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/refund-policy"
                  className="text-minecraft-secondary hover:underline"
                >
                  Refund Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black/50 border-t border-white/10 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Copyright © {new Date().getFullYear()} EnderHOST<sup className="text-xs">®</sup>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PurchaseForm;
