// ============================================================
// CHARTS MODULE - Canvas-based Charts for Analytics Dashboard
// ============================================================

const Charts = {

    // ── Donut Chart ─────────────────────────────────────────────
    drawDonut(canvasId, data, colors, labels) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const cx = w * 0.4;
        const cy = h / 2;
        const outerR = Math.min(cx, cy) - 20;
        const innerR = outerR * 0.6;

        const total = Object.values(data).reduce((a, b) => a + b, 0);
        let startAngle = -Math.PI / 2;

        const entries = Object.entries(data);
        entries.forEach(([key, value], i) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
            ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            startAngle += sliceAngle;
        });

        // Center text
        ctx.fillStyle = '#32363A';
        ctx.font = '600 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total, cx, cy - 8);
        ctx.fillStyle = '#6A6D70';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.fillText('Total', cx, cy + 14);

        // Legend
        const legendX = w * 0.7;
        let legendY = 30;
        entries.forEach(([key, value], i) => {
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.roundRect(legendX, legendY - 5, 10, 10, 2);
            ctx.fill();

            ctx.fillStyle = '#32363A';
            ctx.font = '500 12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${key}`, legendX + 16, legendY + 3);

            ctx.fillStyle = '#6A6D70';
            ctx.font = '400 12px Inter, sans-serif';
            ctx.fillText(`${value}`, legendX + 120, legendY + 3);

            legendY += 24;
        });
    },

    // ── Bar Chart ───────────────────────────────────────────────
    drawBar(canvasId, data, colors) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        const entries = Object.entries(data);
        const maxVal = Math.max(...entries.map(e => e[1]));
        const barCount = entries.length;
        const barWidth = Math.min(40, (chartW / barCount) * 0.6);
        const barGap = (chartW - barWidth * barCount) / (barCount + 1);

        // Grid lines
        const gridSteps = 5;
        for (let i = 0; i <= gridSteps; i++) {
            const y = padding.top + (chartH / gridSteps) * i;
            ctx.strokeStyle = '#E5E5E6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            const val = Math.round(maxVal - (maxVal / gridSteps) * i);
            ctx.fillStyle = '#6A6D70';
            ctx.font = '400 11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, padding.left - 8, y);
        }

        // Bars
        entries.forEach(([key, value], i) => {
            const x = padding.left + barGap + (barWidth + barGap) * i;
            const barH = (value / maxVal) * chartH;
            const y = padding.top + chartH - barH;

            // Gradient
            const grad = ctx.createLinearGradient(x, y, x, y + barH);
            const color = colors[i % colors.length];
            grad.addColorStop(0, color);
            grad.addColorStop(1, color + '99');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
            ctx.fill();

            // Value on top
            ctx.fillStyle = '#32363A';
            ctx.font = '600 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 8);

            // Label
            ctx.fillStyle = '#6A6D70';
            ctx.font = '400 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(key, x + barWidth / 2, h - padding.bottom + 18);
        });
    },

    // ── Line Chart ──────────────────────────────────────────────
    drawLine(canvasId, labels, datasets) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const padding = { top: 30, right: 20, bottom: 50, left: 40 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        const allValues = datasets.flatMap(d => d.data);
        const maxVal = Math.max(...allValues) + 2;
        const stepX = chartW / (labels.length - 1);

        // Grid
        const gridSteps = 5;
        for (let i = 0; i <= gridSteps; i++) {
            const y = padding.top + (chartH / gridSteps) * i;
            ctx.strokeStyle = '#E5E5E6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            const val = Math.round(maxVal - (maxVal / gridSteps) * i);
            ctx.fillStyle = '#6A6D70';
            ctx.font = '400 11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, padding.left - 8, y);
        }

        // X labels
        labels.forEach((label, i) => {
            const x = padding.left + stepX * i;
            ctx.fillStyle = '#6A6D70';
            ctx.font = '400 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, h - padding.bottom + 18);
        });

        // Lines
        datasets.forEach(dataset => {
            const points = dataset.data.map((val, i) => ({
                x: padding.left + stepX * i,
                y: padding.top + chartH - (val / maxVal) * chartH
            }));

            // Area fill
            ctx.beginPath();
            ctx.moveTo(points[0].x, padding.top + chartH);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
            ctx.closePath();
            ctx.fillStyle = dataset.color + '15';
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.strokeStyle = dataset.color;
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Dots
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.strokeStyle = dataset.color;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        });

        // Legend
        let legendX = padding.left;
        const legendY = h - 10;
        datasets.forEach(dataset => {
            ctx.fillStyle = dataset.color;
            ctx.beginPath();
            ctx.arc(legendX + 5, legendY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#32363A';
            ctx.font = '500 11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(dataset.label, legendX + 14, legendY + 4);
            legendX += ctx.measureText(dataset.label).width + 30;
        });
    },

    // ── Stacked Bar (Progress) ──────────────────────────────────
    drawTestProgress(canvasId, testPlans) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const barHeight = 28;
        const gap = 40;
        const labelWidth = 200;

        testPlans.forEach((tp, i) => {
            const y = 20 + i * (barHeight + gap);
            const total = tp.totalCases;
            const barW = w - labelWidth - 80;

            // Label
            ctx.fillStyle = '#32363A';
            ctx.font = '500 12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(tp.name.substring(0, 28), 0, y + barHeight / 2 + 4);

            // Background
            ctx.fillStyle = '#E5E5E6';
            ctx.beginPath();
            ctx.roundRect(labelWidth, y, barW, barHeight, 4);
            ctx.fill();

            // Passed
            const passedW = (tp.passed / total) * barW;
            if (passedW > 0) {
                ctx.fillStyle = '#107E3E';
                ctx.beginPath();
                ctx.roundRect(labelWidth, y, passedW, barHeight, [4, 0, 0, 4]);
                ctx.fill();
            }

            // Failed
            const failedW = (tp.failed / total) * barW;
            if (failedW > 0) {
                ctx.fillStyle = '#BB0000';
                ctx.fillRect(labelWidth + passedW, y, failedW, barHeight);
            }

            // Count text
            ctx.fillStyle = '#6A6D70';
            ctx.font = '400 11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${tp.passed}/${total} passed`, labelWidth + barW + 8, y + barHeight / 2 + 4);
        });
    }
};
