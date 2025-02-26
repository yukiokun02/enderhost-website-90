
import { Users, Server, Shield } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Players",
  },
  {
    icon: Server,
    value: "10,000+",
    label: "Servers Hosted",
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Uptime Guaranteed",
  },
];

export default function Stats() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-minecraft-light flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-minecraft-primary" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-2 text-minecraft-primary">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
