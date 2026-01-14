"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";

type Props = {
  amountKM: number;
};

export default function PayPalButton({ amountKM }: Props) {
  const amountEUR = (amountKM / 1.95583).toFixed(2);

  return (
    <div className="mt-3 max-w-xs">
      <PayPalButtons
        style={{ layout: "vertical" }}

        createOrder={(_, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "EUR",
                  value: amountEUR,
                },
                description: `Cake order payment (${amountKM} KM)`,
              },
            ],
          });
        }}

        onApprove={(_, actions) => {
          if (!actions.order) {
            return Promise.reject("No order");
          }

          return actions.order.capture().then(() => {
            alert("Payment successful (sandbox)");
          });
        }}
      />
    </div>
  );
}
