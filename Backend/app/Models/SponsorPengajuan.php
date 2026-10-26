<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SponsorPengajuan extends Model
{
    protected $table = 'sponsor_pengajuan';

    protected $primaryKey = 'id_sponsor';

    public $timestamps = false;

    protected $fillable = [
        'id_pengajuan',
        'nama_sponsor',
        'kontak_sponsor',
    ];

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