<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kota extends Model
{
    protected $table = 'kota';

    protected $primaryKey = 'id_kota';

    protected $fillable = [
        'id_provinsi',
        'nama_kota',
    ];

    public function provinsi(): BelongsTo
    {
        return $this->belongsTo(
            Provinsi::class,
            'id_provinsi',
            'id_provinsi'
        );
    }
}