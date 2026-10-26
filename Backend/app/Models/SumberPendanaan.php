<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SumberPendanaan extends Model
{
    protected $table = 'sumber_pendanaan';

    protected $primaryKey = 'id_sumber';

    public $timestamps = false;

    protected $fillable = [
        'nama_sumber',
    ];

    public function pengajuan(): BelongsToMany
    {
        return $this->belongsToMany(
            PengajuanTurnamen::class,
            'pengajuan_sumber_pendanaan',
            'id_sumber',
            'id_pengajuan',
            'id_sumber',
            'id_pengajuan'
        )->using(PengajuanSumberPendanaan::class);
    }
}
?>