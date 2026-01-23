<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FAQ;
use Illuminate\Http\Request;

class FAQController extends Controller
{
    public function index()
    {
        return FAQ::orderBy('order')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'status' => 'required|in:published,draft',
            'order' => 'nullable|integer',
        ]);

        $faq = FAQ::create($validated);

        return back()->with('success', 'FAQ created successfully.');
    }

    public function update(Request $request, FAQ $faq)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'status' => 'required|in:published,draft',
            'order' => 'nullable|integer',
        ]);

        $faq->update($validated);

        return back()->with('success', 'FAQ updated successfully.');
    }

    public function destroy(FAQ $faq)
    {
        $faq->delete();
        return back()->with('success', 'FAQ deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:faqs,id',
            'orders.*.order' => 'required|integer',
        ]);

        foreach ($request->orders as $orderData) {
            FAQ::where('id', $orderData['id'])->update(['order' => $orderData['order']]);
        }

        return back()->with('success', 'FAQ order updated.');
    }
}
