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
        // Menghitung batas waktu 5 menit dari waktu sekarang.
        $batasWaktu = now()->subMinutes(
            self::DEADLINE_MINUTES
        );

        // Mengambil pengajuan yang sudah melewati batas waktu.
        $overduePengajuan = PengajuanTurnamen::query()
            ->whereIn('status', [
                'Menunggu Verifikasi',
                'Sedang ditinjau',
            ])
            ->whereRaw(
                'COALESCE(diajukan_ulang_pada, created_at) <= ?',
                [$batasWaktu]
            )
            ->orderByRaw(
                'COALESCE(diajukan_ulang_pada, created_at) ASC'
            )
            ->get([
                'id_pengajuan',
                'nama_turnamen',
                'status',
                'created_at',
                'diajukan_ulang_pada',
            ]);

        // Jika ada pengajuan yang melewati tenggat,
        // fitur Admin lainnya dikunci sementara.
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

        // Jika tidak ada pengajuan terlambat,
        // request dapat dilanjutkan.
        return $next($request);
    }
}
?>