<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pendanaan extends Model
{
    protected $table = 'pendanaan';

    protected $primaryKey = 'id_pendanaan';

    public $timestamps = false;

    protected $fillable = [
        'id_pengajuan',
        'jenis_biaya',
        'biaya_pendaftaran',
    ];

    protected function casts(): array
    {
        return [
            'biaya_pendaftaran' => 'decimal:2',
        ];
    }

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(
            PengajuanTurnamen::class,
            'id_pengajuan',
            'id_pengajuan'
        );
    }
}
?>