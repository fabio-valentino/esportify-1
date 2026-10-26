<?php

namespace App\Http\Middleware;

use App\Models\PengajuanTurnamen;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminPengajuanDeadline
{
    /**
     * Batas waktu pengambilan keputusan Admin.
     * Untuk testing: 5 menit.
     */
    private const DEADLINE_MINUTES = 5;

    public function handle(Request $request, Closure $next): Response
    {
        $overduePengajuan = PengajuanTurnamen::query()
            ->whereIn('status', [
                'Menunggu Verifikasi',
                'Sedang ditinjau',
            ])
            ->where('created_at', '<=', now()->subMinutes(
                self::DEADLINE_MINUTES
            ))
            ->orderBy('created_at', 'asc')
            ->get([
                'id_pengajuan',
                'nama_turnamen',
                'status',
                'created_at',
            ]);

        if ($overduePengajuan->isNotEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Ada pengajuan turnamen yang sudah melewati tenggat dan wajib diputuskan terlebih dahulu.',
                'data' => [
                    'jumlah_pengajuan_terlambat' => $overduePengajuan->count(),
                    'pengajuan' => $overduePengajuan,
                ],
            ], 423);
        }

        return $next($request);
    }
}
?>