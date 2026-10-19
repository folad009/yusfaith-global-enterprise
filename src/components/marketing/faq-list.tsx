const questions = [
  {
    question: "How do I get a price?",
    answer:
      "Submit a quotation request with the product and quantity. The sales team replies with a price after reviewing the enquiry. This website does not publish live prices.",
  },
  {
    question: "Can I buy in bulk?",
    answer:
      "Yes. Use the wholesale page or the project cement line, then send an enquiry. Bulk releases are confirmed with the sales team, not on this page.",
  },
  {
    question: "Does submitting a form place an order?",
    answer:
      "No. A form stores an enquiry. An order is confirmed only after the sales team agrees the quotation with you.",
  },
  {
    question: "Where do I collect materials?",
    answer:
      "The proof of concept refers to a Lagos yard. A street address has not been published. Collection or delivery is arranged in the quotation.",
  },
];

export function FaqList() {
  return (
    <div className="grid gap-3">
      {questions.map((item) => (
        <details key={item.question} className="group bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-[#1c1b19] [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="text-xl leading-none font-medium text-[#e15a12] group-open:hidden" aria-hidden="true">
              +
            </span>
            <span className="hidden text-xl leading-none font-medium text-[#e15a12] group-open:inline" aria-hidden="true">
              –
            </span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-6 text-[#1c1b19]/75">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
