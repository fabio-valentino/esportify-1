<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PengajuanSumberPendanaan extends Pivot
{
    protected $table = 'pengajuan_sumber_pendanaan';

    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = null;

    protected $fillable = [
        'id_pengajuan',
        'id_sumber',
    ];

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(
            PengajuanTurnamen::class,
            'id_pengajuan',
            'id_pengajuan'
        );
    }

    public function sumberPendanaan(): BelongsTo
    {
        return $this->belongsTo(
            SumberPendanaan::class,
            'id_sumber',
            'id_sumber'
        );
    }
}
?>